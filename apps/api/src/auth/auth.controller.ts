import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { CurrentUser, type RequestUser } from "./decorators/current-user.decorator";
import { LoginDto } from "./dto/login.dto";
import { MfaEnableDto } from "./dto/mfa-enable.dto";
import { MfaVerifyLoginDto } from "./dto/mfa-verify-login.dto";
import { RegisterDto } from "./dto/register.dto";
import { MfaService } from "./mfa.service";
import { AuthRateLimitGuard } from "./guards/auth-rate-limit.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

const REFRESH_COOKIE = "wtp_refresh";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly mfa: MfaService
  ) {}

  @Post("register")
  @UseGuards(AuthRateLimitGuard)
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const tokens = await this.auth.register(dto.email, dto.password);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken, expiresIn: tokens.expiresIn };
  }

  @Post("login")
  @HttpCode(200)
  @UseGuards(AuthRateLimitGuard)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const tokens = await this.auth.login(dto.email, dto.password, {
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    });
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken, expiresIn: tokens.expiresIn };
  }

  @Post("refresh")
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (!token) {
      return { accessToken: null };
    }
    const tokens = await this.auth.refresh(token);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken, expiresIn: tokens.expiresIn };
  }

  @Post("logout")
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (token) {
      await this.auth.logout(token);
    }
    res.clearCookie(REFRESH_COOKIE);
  }

  @Post("mfa/setup")
  @UseGuards(JwtAuthGuard)
  mfaSetup(@CurrentUser() user: RequestUser) {
    return this.mfa.generateSetup(user.userId, user.email);
  }

  @Post("mfa/enable")
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async mfaEnable(@CurrentUser() user: RequestUser, @Body() dto: MfaEnableDto) {
    await this.mfa.enable(user.userId, dto.secret, dto.code);
    return { mfaEnabled: true };
  }

  @Post("mfa/verify")
  @HttpCode(200)
  @UseGuards(AuthRateLimitGuard)
  async mfaVerifyLogin(
    @Body() dto: MfaVerifyLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const tokens = await this.auth.completeMfaLogin(dto.challengeToken, dto.code, {
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    });
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken, expiresIn: tokens.expiresIn };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: RequestUser) {
    return { id: user.userId, email: user.email, mfaEnabled: false };
  }

  private setRefreshCookie(res: Response, refreshToken: string): void {
    res.cookie(REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/v1/auth/refresh",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }
}
