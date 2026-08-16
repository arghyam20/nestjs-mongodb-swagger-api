import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Version,
  HttpCode,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UserGroup } from 'src/common/decorator/user-group.decorator';
import { SettingServiceApi } from './setting.api.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateSettingDto } from 'src/modules/setting/dto/setting.dto';
import { RBAcGuard } from 'src/common/guards/rbac.guard';
import { AdminGroup } from 'src/common/decorator/admin-group.decorator';

@ApiTags('Admin Setting')
@Controller('admin/setting')
export class SettingApiController {
  constructor(private homeCmsService: SettingServiceApi) {}

  @Version('1')
  @Get('get')
  @AdminGroup()
  @UserGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async getSetting() {
    return this.homeCmsService.get();
  }

  @Version('1')
  @Post('update')
  @AdminGroup()
  @UserGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async updateSetting(@Body() dto: UpdateSettingDto) {
    return this.homeCmsService.update(dto);
  }
}
