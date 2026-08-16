import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { ApiConfigModule } from 'src/config.module';
import { HelpersModule } from 'src/helpers/helpers.module';
import { RoleModule } from './modules/role/role.module';
import { RoleRepositoryModule } from './modules/role/repositories/role.repository.module';
import { UserModule } from './modules/user/user.module';
import { UserRepositoryModule } from './modules/user/repositories/user-repository.module';
import { CmsModule } from './modules/cms/cms.module';
import { CmsRepositoryModule } from './modules/cms/repositories/cms.repository.module';
import { SettingModule } from './modules/setting/setting.module';
import { SettingRepositoryModule } from './modules/setting/repositories/setting.repository.module';
import { AdminModule } from './modules/admin/admin.module';
import { ContactUsModule } from './modules/contact-us/contact-us.module';
import { ContactUsRepositoryModule } from './modules/contact-us/repositories/contact-us.repository.module';
import { AdminReplyRepositoryModule } from './modules/admin-reply/admin-reply.repository.module';
import { UserDeviceRepositoryModule } from './modules/user-devices/repository/user-device-repository.module';
import { RefreshTokenModule } from './modules/refresh-token/refresh-token.module';
import { CategoryModule } from './modules/category/category.module';
import { CategoryRepositoryModule } from './modules/category/repositories/category.repository.module';
import { AccessModule } from './modules/access/access.module';
import { AccessRepositoryModule } from './modules/access/repositories/access.repository.module';
import { MediaModule } from './modules/media/media.module';
import { MediaRepositoryModule } from './modules/media/repositories/media.repository.module';
import { NotificationModule } from './modules/notification/notification.module';
import { NotificationRepositoryModule } from './modules/notification/repositories/notification.repository.module';

@Module({
  imports: [
    AuthModule,
    ApiConfigModule,
    HelpersModule,
    RefreshTokenModule,
    RoleModule,
    RoleRepositoryModule,
    UserDeviceRepositoryModule,
    UserModule,
    UserRepositoryModule,
    AdminModule,
    CmsModule,
    CmsRepositoryModule,
    SettingModule,
    SettingRepositoryModule,
    ContactUsModule,
    ContactUsRepositoryModule,
    AdminReplyRepositoryModule,
    CategoryModule,
    CategoryRepositoryModule,
    AccessModule,
    AccessRepositoryModule,
    MediaModule,
    MediaRepositoryModule,
    NotificationModule,
    NotificationRepositoryModule,
  ],
  providers: [],
})
export class AppModule {}
