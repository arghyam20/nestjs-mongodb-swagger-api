import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiConfigModule } from '../../config.module';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Role, RoleSchema } from '../role/schemas/role.schema';
import { SeederService } from './seeder.service';

@Module({
  imports: [
    ApiConfigModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  providers: [SeederService],
})
export class SeederModule {}
