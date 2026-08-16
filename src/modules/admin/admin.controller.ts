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
import { AuthGuard } from '@nestjs/passport';
import {
  ChangeAdminPasswordDto,
  UpdateAdminUserDto,
} from 'src/modules/admin/dto/admin.dto';
import { SingleFileInterceptor } from 'src/common/interceptors/files.interceptor';
import { LoginUser } from 'src/common/decorator/login-user.decorator';
import { UserDocument } from '../user/schemas/user.schema';
import { RBAcGuard } from 'src/common/guards/rbac.guard';
import { AdminGroup } from 'src/common/decorator/admin-group.decorator';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private userService: AdminService) {}

  @Version('1')
  @Get('profile-details')
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async profileDetails(@LoginUser() user: Partial<UserDocument>) {
    return this.userService.profileDetails(user);
  }

  @Version('1')
  @Post('update')
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(SingleFileInterceptor('user', 'profileImage'))
  async updateAdminUser(
    @Body() dto: UpdateAdminUserDto,
    @UploadedFiles() files: any[],
    @LoginUser() user: Partial<UserDocument>,
  ) {
    return this.userService.updateAdminUser(dto, files, user);
  }

  @Version('1')
  @Post('change-password')
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async changeAdminUserPassword(
    @Body() dto: ChangeAdminPasswordDto,
    @LoginUser() user: Partial<UserDocument>,
  ) {
    return this.userService.changePassword(dto, user);
  }

  @Version('1')
  @Get('dashboard')
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async getDashboardStatistics() {
    return this.userService.dashboardPageStats();
  }
}
