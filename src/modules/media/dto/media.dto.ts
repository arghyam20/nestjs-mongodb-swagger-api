import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class SingleFileUploadDTO {
  @ApiProperty({
    description: 'File to upload',
    type: 'string',
    format: 'binary',
  })
  file: any;

  @ApiProperty({
    description: 'Directory path for the file (optional)',
    required: false,
    default: 'media',
  })
  @IsOptional()
  directory?: string = 'media';
}

export class MultipleFileUploadDTO {
  @ApiProperty({
    description: 'Multiple files to upload',
    type: 'string',
    format: 'binary',
    isArray: true,
  })
  files: any[];

  @ApiProperty({
    description: 'Directory path for the files (optional)',
    required: false,
    default: 'media',
  })
  @IsOptional()
  directory?: string = 'media';
}

export class DeleteMediaDTO {
  @ApiProperty({
    description: "Key of the file to delete (e.g., 'uploads/folder/filename')",
  })
  @IsNotEmpty({ message: 'Key is required' })
  key: string;
}
