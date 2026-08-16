import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';

@Injectable()
export class PushNotificationHelper {
  private readonly logger = new Logger(PushNotificationHelper.name);

  constructor(private readonly configService: ConfigService) {
    const publicKey = this.configService.get<string>('WEB_PUSH_PUBLIC_KEY');
    const privateKey = this.configService.get<string>('WEB_PUSH_PRIVATE_KEY');

    if (!publicKey || !privateKey) {
      this.logger.error(
        'Web Push VAPID keys are missing in environment variables.',
      );
    }
    webpush.setVapidDetails(
      'mailto:arghya.mitra@webskitters.com',
      publicKey,
      privateKey,
    );
  }

  async sendWebPushNotification(subscription: any, notification: any) {
    try {
      const payload = JSON.stringify({
        title: notification.title,
        body: notification.body,
        type: notification.type,
      });

      await webpush.sendNotification(subscription, payload);

      return true;
    } catch (error) {
      this.logger.error(`Web push failed: ${error.message}`);
      return false;
    }
  }
}
