import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Notification,
  NotificationSchema,
} from '../schemas/notification.schema';
import { NotificationRepository } from './notification.repository';

@Global()
@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Notification.name,
        useFactory: () => {
          const schema = NotificationSchema;
          return schema;
        },
      },
    ]),
  ],
  controllers: [],
  providers: [NotificationRepository],
  exports: [NotificationRepository],
})
export class NotificationRepositoryModule {}
