import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from './schemas/role.schema';
import { RoleAdminService } from './role.admin.service';
import { RoleAdminController } from './role.admin.controller';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
  ],
  controllers: [RoleAdminController],
  providers: [RoleAdminService],
  exports: [RoleAdminService],
})
export class RoleModule {}
