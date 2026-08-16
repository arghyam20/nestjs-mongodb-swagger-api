import { Module } from '@nestjs/common';
import { CategoryAdminController } from './category.admin.controller';
import { CategoryApiController } from './category.api.controller';
import { CategoryAdminService } from './category.admin.service';
import { CategoryApiService } from './category.api.service';

@Module({
  imports: [],
  controllers: [CategoryAdminController, CategoryApiController],
  providers: [CategoryAdminService, CategoryApiService],
  exports: [CategoryAdminService, CategoryApiService],
})
export class CategoryModule {}
