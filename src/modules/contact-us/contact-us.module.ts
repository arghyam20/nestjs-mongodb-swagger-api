import { Module } from '@nestjs/common';
import { ContactUsAdminController } from './contact-us.admin.controller';
import { ContactUsAdminService } from './contact-us.admin.service';
import { BullModule } from '@nestjs/bull';
import { ExportQueueService } from 'src/helpers/queue.helper';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'export-queue',
    }),
  ],
  controllers: [ContactUsAdminController],
  providers: [ContactUsAdminService, ExportQueueService],
  exports: [ContactUsAdminService],
})
export class ContactUsModule {}
