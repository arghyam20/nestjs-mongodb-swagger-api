import { Module } from '@nestjs/common';
import { MediaAdminController } from './media.admin.controller';
import { MediaService } from './media.service';
import { MediaApiController } from './media.api.controller';

@Module({
  imports: [],
  controllers: [MediaAdminController, MediaApiController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
