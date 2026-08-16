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
import { CmsAdminService } from './cms.admin.service';
import { AuthGuard } from '@nestjs/passport';
import {
  CmsListingDto,
  StatusCmsDto,
  UpdateCmsDto,
} from 'src/modules/cms/dto/cms.dto';
import { RBAcGuard } from 'src/common/guards/rbac.guard';
import { AdminGroup } from 'src/common/decorator/admin-group.decorator';

@ApiTags('Admin CMS')
@Controller('admin/cms')
export class CmsAdminController {
  constructor(private cmsService: CmsAdminService) {}

  @Version('1')
  @Post('getall')
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async getAllCms(@Body() dto: CmsListingDto) {
    return this.cmsService.getAll(dto);
  }

  @Version('1')
  @Get('get/:id')
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async getCms(@Param('id') id: string) {
    return this.cmsService.get(id);
  }

  @Version('1')
  @Post('update')
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async updateCms(@Body() dto: UpdateCmsDto) {
    return this.cmsService.update(dto);
  }

  @Version('1')
  @Post('status-change')
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async statusChange(@Body() dto: StatusCmsDto) {
    return this.cmsService.statusUpdate(dto);
  }
}
