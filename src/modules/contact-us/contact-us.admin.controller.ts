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
import { ContactUsAdminService } from './contact-us.admin.service';
import { AuthGuard } from '@nestjs/passport';
import {
  ContactUsListingDto,
  SendReplyDTO,
} from 'src/modules/contact-us/dto/contact-us.dto';
import { RBAcGuard } from 'src/common/guards/rbac.guard';
import { AdminGroup } from 'src/common/decorator/admin-group.decorator';

@ApiTags('Admin Contact Us')
@Controller('admin/contact-us')
export class ContactUsAdminController {
  constructor(private contactUsService: ContactUsAdminService) {}

  @Version('1')
  @Post('getall')
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async getAllContactUs(@Body() dto: ContactUsListingDto) {
    return this.contactUsService.getAll(dto);
  }

  @Version('1')
  @Get('get/:id')
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async getContactUs(@Param('id') id: string) {
    return this.contactUsService.get(id);
  }

  @Version('1')
  @Get('delete/:id')
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async deleteContactUs(@Param('id') id: string) {
    return this.contactUsService.delete(id);
  }

  @Version('1')
  @Post('send-reply')
  @AdminGroup()
  @UseGuards(AuthGuard('jwt'), RBAcGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiConsumes('application/json')
  async sendReply(@Body() dto: SendReplyDTO) {
    return this.contactUsService.sendReply(dto);
  }
}
