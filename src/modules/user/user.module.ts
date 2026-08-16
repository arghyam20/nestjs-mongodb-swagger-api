import { Module } from '@nestjs/common';
import { UserAdminController } from './user.admin.controller';
import { UserAdminService } from './user.admin.service';
import { UserApiController } from './user.api.controller';
import { UserApiService } from './user.api.service';

@Module({
  imports: [],
  controllers: [UserAdminController, UserApiController],
  providers: [UserAdminService, UserApiService],
})
export class UserModule {}
