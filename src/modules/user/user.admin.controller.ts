import 'multer';
import {
  Body,
  Controller,
  Post,
  UseGuards,
  Version,
  UseInterceptors,
  UploadedFiles,
  Param,
  Get,
  HttpCode,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import {
  ListingFrontendUserDto,
  ListingUserDto,
  SaveFrontendUserDTO,
  StatusUserDto,
  UpdateFrontendUserDto,
} from 'src/modules/user/dto/user.dto';
import { SingleFileInterceptor } from 'src/common/interceptors/files.interceptor';
import { UserAdminService } from './user.admin.service';
import { RBAcGuard } from 'src/common/guards/rbac.guard';
import { Permission } from 'src/common/decorator/permissions.decorator';
import { AdminGroup } from 'src/common/decorator/admin-group.decorator';
import { PermissionAction } from 'src/common/enum/permission-action.enum';

@ApiTags('Admin User')
@Controller('admin/user')
export class UserAdminController {
  constructor(private userService: UserAdminService) {}

  @Version('1')
  @Post('getall')
  @Permission('user', PermissionAction.READ)
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async getAllFrontendUser(
    @Body() dto: ListingFrontendUserDto,
    @Req() req: any,
  ) {
    return this.userService.getAllFrontendUsers(dto, req.user);
  }

  @Version('1')
  @Post('save')
  @Permission('user', PermissionAction.WRITE)
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(SingleFileInterceptor('user', 'profileImage'))
  async saveFrontendUser(
    @Body() dto: SaveFrontendUserDTO,
    @UploadedFiles() files: any[],
    @Req() req: any,
  ) {
    return this.userService.saveFrontendUser(dto, files, req.user);
  }

  @Version('1')
  @Get('get/:id')
  @Permission('user', PermissionAction.READ)
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async getFrontendUser(@Param('id') id: string) {
    return this.userService.getFrontendUser(id);
  }

  @Version('1')
  @Post('update')
  @Permission('user', PermissionAction.EDIT)
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(SingleFileInterceptor('user', 'profileImage'))
  async updateFrontendUser(
    @Body() dto: UpdateFrontendUserDto,
    @UploadedFiles() files: any[],
    @Req() req: any,
  ) {
    return this.userService.updateFrontendUser(dto, files, req.user);
  }

  @Version('1')
  @Post('status-change')
  @Permission('user', PermissionAction.EDIT)
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async statusChangeFrontendUser(@Body() dto: StatusUserDto, @Req() req: any) {
    return this.userService.statusUpdateFrontendUser(dto, req.user);
  }

  @Version('1')
  @Get('delete/:id')
  @Permission('user', PermissionAction.DELETE)
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async deleteFrontendUser(@Param('id') id: string, @Req() req: any) {
    return this.userService.deleteFrontendUser(id, req.user);
  }

  @Version('1')
  @Post('listing')
  @Permission('user', PermissionAction.READ)
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async getListing(@Body() dto: ListingUserDto, @Req() req: any) {
    return this.userService.getListing(dto, req.user);
  }
}
