import { Module } from '@nestjs/common';
import { SettingApiController } from './setting.api.controller';
import { SettingServiceApi } from './setting.api.service';
import { BullModule } from '@nestjs/bull';
import { ExportQueueService } from 'src/helpers/queue.helper';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'export-queue',
    }),
  ],
  controllers: [SettingApiController],
  providers: [SettingServiceApi, ExportQueueService],
  exports: [SettingServiceApi],
})
export class SettingModule {}
