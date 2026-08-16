import {
  Controller,
  UseGuards,
  Version,
  Post,
  Body,
  Get,
  Param,
  HttpCode,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { RoleAdminService } from './role.admin.service';
import { AuthGuard } from '@nestjs/passport';
import {
  RoleListingDto,
  SaveRoleDto,
  StatusRoleDto,
  UpdateRoleDto,
} from './dto/role.dto';
import { RBAcGuard } from 'src/common/guards/rbac.guard';
import { Permission } from 'src/common/decorator/permissions.decorator';
import { AdminGroup } from 'src/common/decorator/admin-group.decorator';
import { PermissionAction } from 'src/common/enum/permission-action.enum';
import { LoginUser } from 'src/common/decorator/login-user.decorator';
import { UserDocument } from '../user/schemas/user.schema';

@ApiTags('Role')
@Controller('admin/role')
export class RoleAdminController {
  constructor(private roleService: RoleAdminService) {}

  @Version('1')
  @Post('save')
  @Permission('role', PermissionAction.WRITE)
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async saveRole(@Body() dto: SaveRoleDto, @Req() req: any) {
    return this.roleService.save(dto, req.user);
  }

  @Version('1')
  @Get('get/:id')
  @Permission('role', PermissionAction.READ)
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async getRole(@Param('id') id: string) {
    return this.roleService.get(id);
  }

  @Version('1')
  @Post('update')
  @Permission('role', PermissionAction.EDIT)
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async updateRole(@Body() dto: UpdateRoleDto) {
    return await this.roleService.update(dto);
  }

  @Version('1')
  @Post('status-change')
  @Permission('role', PermissionAction.EDIT)
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async statusChange(@Body() dto: StatusRoleDto) {
    return await this.roleService.statusUpdate(dto);
  }

  @Version('1')
  @Get('delete/:id')
  @Permission('role', PermissionAction.DELETE)
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async deleteRole(@Param('id') id: string) {
    return await this.roleService.delete(id);
  }

  @Version('1')
  @Post('getall')
  @Permission('role', PermissionAction.READ)
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async getAllRole(
    @Body() dto: RoleListingDto,
    @LoginUser() user: Partial<UserDocument>,
  ) {
    return this.roleService.getAll(dto, user);
  }
}
