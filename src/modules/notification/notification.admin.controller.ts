import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Param,
  Version,
  HttpCode,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { NotificationAdminService } from './notification.admin.service';
import { AuthGuard } from '@nestjs/passport';
import {
  MarkReadStatusNotificationDto,
  NotificationListingDto,
} from 'src/modules/notification/dto/notification.dto';
import { RBAcGuard } from 'src/common/guards/rbac.guard';
import { LoginUser } from 'src/common/decorator/login-user.decorator';
import { UserDocument } from '../user/schemas/user.schema';
import { AdminGroup } from 'src/common/decorator/admin-group.decorator';

@ApiTags('Admin Notification')
@Controller('admin/notification')
export class NotificationAdminController {
  constructor(private notificationService: NotificationAdminService) {}

  @Version('1')
  @Post('getall')
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async getAllNotification(
    @Body() dto: NotificationListingDto,
    @LoginUser() user: Partial<UserDocument>,
  ) {
    return this.notificationService.getAll(dto, user);
  }

  @Version('1')
  @Post('mark-as-read')
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async readStatusUpdate(
    @Body() dto: MarkReadStatusNotificationDto,
    @LoginUser() user: Partial<UserDocument>,
  ) {
    return this.notificationService.readStatusUpdate(dto, user);
  }

  @Version('1')
  @Get('delete/:id')
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async deleteNotification(@Param('id') id: string) {
    return this.notificationService.delete(id);
  }
}
