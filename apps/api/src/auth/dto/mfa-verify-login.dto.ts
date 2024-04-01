import { IsString, Length } from "class-validator";

export class MfaVerifyLoginDto {
  @IsString()
  challengeToken!: string;

  @IsString()
  @Length(6, 6)
  code!: string;
}
