import { Module } from '@nestjs/common';
import { AccessAdminService } from './access.admin.service';
import { AccessAdminController } from './access.admin.controller';
import { AccessRepositoryModule } from './repositories/access.repository.module';

@Module({
  imports: [AccessRepositoryModule],
  controllers: [AccessAdminController],
  providers: [AccessAdminService],
  exports: [AccessAdminService],
})
export class AccessModule {}
