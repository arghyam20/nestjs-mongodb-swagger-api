import { Module } from '@nestjs/common';
import { NotificationAdminController } from './notification.admin.controller';
import { NotificationAdminService } from './notification.admin.service';
import { NotificationApiController } from './notification.api.controller';
import { NotificationApiService } from './notification.api.service';

@Module({
  controllers: [NotificationAdminController, NotificationApiController],
  providers: [NotificationAdminService, NotificationApiService],
  exports: [NotificationAdminService, NotificationApiService],
})
export class NotificationModule {}
