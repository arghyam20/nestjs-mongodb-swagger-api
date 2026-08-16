import 'multer';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiResponse } from 'src/common/types/api-response.type';
import { MediaRepository } from './repositories/media.repository';
import { SingleFileUploadDTO, MultipleFileUploadDTO } from './dto/media.dto';
import {
  deleteFileFromServer,
  uploadFileToLocalBuffer,
} from 'src/common/interceptors/files.interceptor';
import { normalizeFilename } from 'src/helpers/common.helper';

@Injectable()
export class MediaService {
  constructor(private mediaRepository: MediaRepository) {}

  async uploadSingleFile(
    file: any,
    dto: SingleFileUploadDTO,
  ): Promise<ApiResponse> {
    if (!file) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Please upload a file.',
      };
    }

    const directory = dto.directory || 'media';

    const fileBuffer = file.buffer;
    const filename = normalizeFilename(file.originalname);

    const s3Key = await uploadFileToLocalBuffer(
      filename,
      fileBuffer,
      `uploads/${directory}/`,
    );

    const mediaData = {
      originalName: file.originalname,
      fileName: filename,
      folder: directory,
      mimeType: file.mimetype,
      encoding: file.encoding || '',
      size: file.size,
      key: s3Key,
    };

    const saveFile = await this.mediaRepository.save(mediaData);
    if (saveFile && saveFile._id) {
      return {
        statusCode: HttpStatus.OK,
        message: 'File uploaded successfully.',
        data: saveFile,
      };
    } else {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Something went wrong while saving to database.',
      };
    }
  }

  async uploadMultipleFiles(
    files: any[],
    dto: MultipleFileUploadDTO,
  ): Promise<ApiResponse> {
    if (!files || files.length === 0) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Please upload at least one file.',
      };
    }

    const savedFiles: any[] = [];
    const directory = dto.directory || 'media';

    for (const file of files) {
      const fileBuffer = file.buffer;
      const filename = normalizeFilename(file.originalname);

      const s3Key = await uploadFileToLocalBuffer(
        filename,
        fileBuffer,
        `uploads/${directory}/`,
      );

      const mediaData = {
        originalName: file.originalname,
        fileName: filename,
        folder: directory,
        mimeType: file.mimetype,
        encoding: file.encoding || '',
        size: file.size,
        key: s3Key,
        // path: file.path,
      };

      const saved = await this.mediaRepository.save(mediaData);
      savedFiles.push(saved);
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Files uploaded successfully.',
      data: savedFiles,
    };
  }

  async delete(key: string): Promise<ApiResponse> {
    const mediaDetails = await this.mediaRepository.getByField({
      key: key,
      isDeleted: false,
    });

    if (!mediaDetails) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'File not found.',
      };
    }

    deleteFileFromServer(mediaDetails.key);

    const deleteResult = await this.mediaRepository.updateByField(
      { isDeleted: true },
      { key: key },
    );

    if (deleteResult && deleteResult.modifiedCount > 0) {
      return {
        statusCode: HttpStatus.OK,
        message: 'File deleted successfully.',
        data: deleteResult,
      };
    } else {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Something went wrong.',
      };
    }
  }
}
