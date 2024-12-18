import { Global, Module } from "@nestjs/common";
import { ConsoleEmailAdapter } from "./console-email.adapter";
import { EmailPort } from "./email.port";
import { NotificationDispatcherService } from "./notification-dispatcher.service";
import { TemplateService } from "./template.service";

@Global()
@Module({
  providers: [
    TemplateService,
    NotificationDispatcherService,
    { provide: EmailPort, useClass: ConsoleEmailAdapter },
  ],
  exports: [EmailPort, TemplateService, NotificationDispatcherService],
})
export class NotificationsModule {}
