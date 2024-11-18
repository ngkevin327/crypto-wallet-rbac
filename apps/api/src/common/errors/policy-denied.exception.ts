import { HttpException, HttpStatus } from "@nestjs/common";

export class PolicyDeniedException extends HttpException {
  constructor(
    public readonly reasons: string[],
    public readonly intentId?: string
  ) {
    super(
      {
        code: "POLICY_DENIED",
        message: "Transaction denied by policy",
        reasons,
        intentId,
      },
      HttpStatus.UNPROCESSABLE_ENTITY
    );
  }
}
