import 'multer';
import {
  Body,
  Controller,
  Post,
  UseGuards,
  Version,
  UseInterceptors,
  UploadedFiles,
  Get,
  HttpCode,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UserGroup } from 'src/common/decorator/user-group.decorator';
import { AuthGuard } from '@nestjs/passport';
import {
  ChangePasswordDto,
  ProfileSettingsDTO,
  UpdateUserDto,
} from 'src/modules/user/dto/user.dto';
import { SingleFileInterceptor } from 'src/common/interceptors/files.interceptor';
import { UserApiService } from './user.api.service';
import type { UserDocument } from './schemas/user.schema';
import { LoginUser } from 'src/common/decorator/login-user.decorator';

@ApiTags('User')
@Controller('user')
export class UserApiController {
  constructor(private userService: UserApiService) {}

  @Version('1')
  @Get('profile-details')
  @UserGroup()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async profileDetails(@LoginUser() user: Partial<UserDocument>) {
    return this.userService.profileDetails(user);
  }

  @Version('1')
  @Post('update')
  @UserGroup()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(SingleFileInterceptor('user', 'profileImage'))
  async updateAdminUser(
    @Body() dto: UpdateUserDto,
    @UploadedFiles() files: any[],
    @LoginUser() user: Partial<UserDocument>,
  ) {
    return this.userService.updateAdminUser(dto, files, user);
  }

  @Version('1')
  @Post('change-password')
  @UserGroup()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async changeAdminUserPassword(
    @Body() dto: ChangePasswordDto,
    @LoginUser() user: Partial<UserDocument>,
  ) {
    return this.userService.changePassword(dto, user);
  }

  @Version('1')
  @Post('update-settings')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async updateProfileSettings(
    @Body() dto: ProfileSettingsDTO,
    @LoginUser() user: UserDocument,
  ) {
    return await this.userService.settingUpdate(dto, user);
  }
}
