import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser, type RequestUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { OrgMemberGuard } from "../common/guards/org-member.guard";
import { ConnectWalletDto } from "./dto/connect-wallet.dto";
import { VerifyWalletDto } from "./dto/verify-wallet.dto";
import { WalletService } from "./wallet.service";

@ApiTags("wallets")
@ApiBearerAuth()
@Controller("orgs/:orgId/wallets")
@UseGuards(JwtAuthGuard, OrgMemberGuard)
export class WalletController {
  constructor(private readonly wallets: WalletService) {}

  @Get()
  @ApiOperation({ summary: "List connected Safes for an organization" })
  @ApiResponse({ status: 200, description: "Wallet records including owners and sync metadata" })
  list(@Param("orgId") orgId: string) {
    return this.wallets.listWallets(orgId);
  }

  @Get(":walletId")
  getOne(@Param("orgId") orgId: string, @Param("walletId") walletId: string) {
    return this.wallets.getWallet(orgId, walletId);
  }

  @Post("connect")
  @ApiOperation({
    summary: "Start Safe connect flow",
    description: "Validates the Safe on-chain and returns a challenge message to sign.",
  })
  connect(@Param("orgId") orgId: string, @Body() dto: ConnectWalletDto) {
    return this.wallets.startConnect(orgId, dto.address, dto.chainId, dto.nickname);
  }

  @Post("verify")
  @ApiOperation({
    summary: "Verify wallet ownership",
    description: "Accepts EIP-191 signature over the connect challenge; persists the Safe.",
  })
  verify(
    @Param("orgId") orgId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: VerifyWalletDto
  ) {
    return this.wallets.completeConnect(
      orgId,
      dto.address,
      dto.chainId,
      undefined,
      dto.challengeId,
      dto.signature,
      user.userId
    );
  }
}
