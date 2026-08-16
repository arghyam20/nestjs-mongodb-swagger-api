import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
  Version,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AccessAdminService } from './access.admin.service';
import {
  AccessListingDto,
  SaveAccessDto,
  StatusAccessDto,
  UpdateAccessDto,
} from './dto/access.dto';
import { RBAcGuard } from 'src/common/guards/rbac.guard';
import { Permission } from 'src/common/decorator/permissions.decorator';
import { AdminGroup } from 'src/common/decorator/admin-group.decorator';
import { PermissionAction } from 'src/common/enum/permission-action.enum';

@ApiTags('Admin Access')
@Controller('admin/access')
export class AccessAdminController {
  constructor(private accessService: AccessAdminService) {}

  @Version('1')
  @Post('getall')
  @Permission('access', PermissionAction.READ)
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async getAllAccess(@Body() dto: AccessListingDto) {
    return this.accessService.getAll(dto);
  }

  @Version('1')
  @Post('save')
  @Permission('access', PermissionAction.WRITE)
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async saveAccess(@Body() dto: SaveAccessDto) {
    return this.accessService.save(dto);
  }

  @Version('1')
  @Get('get/:id')
  @Permission('access', PermissionAction.READ)
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async getAccess(@Param('id') id: string) {
    return this.accessService.get(id);
  }

  @Version('1')
  @Post('update')
  @Permission('access', PermissionAction.EDIT)
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async updateAccess(@Body() dto: UpdateAccessDto) {
    return this.accessService.update(dto);
  }

  @Version('1')
  @Post('status-change')
  @Permission('access', PermissionAction.EDIT)
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async statusChange(@Body() dto: StatusAccessDto) {
    return this.accessService.statusUpdate(dto);
  }

  @Version('1')
  @Get('delete/:id')
  @Permission('access', PermissionAction.DELETE)
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async deleteAccess(@Param('id') id: string) {
    return this.accessService.delete(id);
  }

  @Version('1')
  @Get('all-list')
  @Permission('access', PermissionAction.READ)
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async getList() {
    return this.accessService.listing();
  }
}
