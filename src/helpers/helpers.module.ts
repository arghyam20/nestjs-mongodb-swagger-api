import { Global, Module } from '@nestjs/common';
import { UtilsHelper } from './utils.helper';
import { MailerService } from './mailer.helper';
import { PushNotificationHelper } from './push-notification.helper';

@Global()
@Module({
  providers: [UtilsHelper, MailerService, PushNotificationHelper],
  exports: [UtilsHelper, MailerService, PushNotificationHelper],
})
export class HelpersModule {}
