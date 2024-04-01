import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PasswordService } from "./password.service";
import { MfaService } from "./mfa.service";
import { AuthRateLimitGuard } from "./guards/auth-rate-limit.guard";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("jwtAccessSecret") ?? "dev-secret-min-16-chars",
        signOptions: {
          expiresIn: config.get<string>("JWT_ACCESS_TTL") ?? "24h",
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PasswordService, MfaService, JwtStrategy, AuthRateLimitGuard],
  exports: [AuthService, PasswordService],
})
export class AuthModule {}
