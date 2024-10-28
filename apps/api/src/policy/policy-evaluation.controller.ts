import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { EvaluatePolicyDto } from "./dto/evaluate-policy.dto";
import { PolicyEvaluationService } from "./policy-evaluation.service";

@ApiTags("policies")
@ApiBearerAuth()
@Controller("policy")
@UseGuards(JwtAuthGuard)
export class PolicyEvaluationController {
  constructor(private readonly evaluation: PolicyEvaluationService) {}

  @Post("evaluate")
  @ApiOperation({ summary: "Dry-run policy evaluation for a draft intent" })
  evaluate(@Body() dto: EvaluatePolicyDto) {
    return this.evaluation.evaluateIntent(dto);
  }
}
