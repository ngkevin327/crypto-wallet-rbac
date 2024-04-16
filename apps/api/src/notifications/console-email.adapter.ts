import { Injectable, Logger } from "@nestjs/common";
import { EmailPort, type SendEmailInput } from "./email.port";

@Injectable()
export class ConsoleEmailAdapter extends EmailPort {
  private readonly logger = new Logger(ConsoleEmailAdapter.name);

  async send(input: SendEmailInput): Promise<void> {
    this.logger.log(`Email to=${input.to} subject=${input.subject}\n${input.text}`);
  }
}
