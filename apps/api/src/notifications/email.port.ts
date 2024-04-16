export interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
}

export abstract class EmailPort {
  abstract send(input: SendEmailInput): Promise<void>;
}
