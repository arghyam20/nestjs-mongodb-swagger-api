import { Module } from '@nestjs/common';
import { CmsAdminController } from './cms.admin.controller';
import { CmsAdminService } from './cms.admin.service';

@Module({
  imports: [],
  controllers: [CmsAdminController],
  providers: [CmsAdminService],
  exports: [CmsAdminService],
})
export class CmsModule {}
