import {
  Body,
  Controller,
  UseGuards,
  Version,
  Get,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { NotificationApiService } from './notification.api.service';
import {
  MarkReadStatusNotificationDto,
  NotificationListingDto,
} from './dto/notification.dto';
import { UserDocument } from '../user/schemas/user.schema';
import { LoginUser } from 'src/common/decorator/login-user.decorator';

@ApiTags('Notification')
@Controller('notification')
export class NotificationApiController {
  constructor(private notificationService: NotificationApiService) {}

  @Version('1')
  @Post('getall')
  @UseGuards(AuthGuard('jwt'))
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
  @UseGuards(AuthGuard('jwt'))
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
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async deleteNotification(@Param('id') id: string) {
    return this.notificationService.delete(id);
  }

  @Version('1')
  @Get('delete-all')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async deleteAllNotification(@LoginUser() user: Partial<UserDocument>) {
    return this.notificationService.deleteAll(user);
  }

  @Version('1')
  @Get('unread-count')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async unreadCount(@LoginUser() user: Partial<UserDocument>) {
    return this.notificationService.unreadCount(user);
  }
}
