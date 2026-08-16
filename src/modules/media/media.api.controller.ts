import 'multer';
import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  HttpCode,
  UploadedFile,
  Version,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { MediaService } from './media.service';
import {
  SingleFileUploadDTO,
  MultipleFileUploadDTO,
  DeleteMediaDTO,
} from './dto/media.dto';
import {
  memoryFileInterceptor,
  memoryFilesInterceptor,
} from 'src/common/interceptors/files.interceptor';

@ApiTags('Media')
@Controller('media')
export class MediaApiController {
  constructor(private mediaService: MediaService) {}

  @Version('1')
  @Post('upload-single-file')
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(memoryFileInterceptor('file'))
  async uploadSingleFile(
    @UploadedFile() file: any,
    @Body() dto: SingleFileUploadDTO,
  ) {
    return await this.mediaService.uploadSingleFile(file, dto);
  }

  @Version('1')
  @Post('upload-multiple-file')
  @HttpCode(200)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(memoryFilesInterceptor('files'))
  async uploadMultipleFile(
    @UploadedFiles() files: any[],
    @Body() dto: MultipleFileUploadDTO,
  ) {
    return await this.mediaService.uploadMultipleFiles(files, dto);
  }

  @Version('1')
  @Post('delete')
  @HttpCode(200)
  @ApiConsumes('application/json')
  async delete(@Body() dto: DeleteMediaDTO) {
    return await this.mediaService.delete(dto.key);
  }
}
