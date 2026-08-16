import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { Types } from 'mongoose';

export class SaveAccessDto {
  @ApiProperty({ description: 'Access name', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  name: string;

  @ApiProperty({ description: 'Access slug', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Slug is required' })
  @Transform(({ value }: TransformFnParams) => value?.trim().toLowerCase())
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'Slug must be lowercase, hyphen-separated, and contain only letters and numbers',
  })
  slug: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Parent Access ID', required: false })
  @IsOptional()
  @IsMongoId({ message: 'ParentId must be a valid ObjectId' })
  parentId?: Types.ObjectId;

  @ApiProperty({ description: 'Impact', required: false })
  @IsOptional()
  impact?: boolean;

  @ApiProperty({ description: 'Required', required: false })
  @IsOptional()
  required?: boolean;
}

export class UpdateAccessDto extends SaveAccessDto {
  @ApiProperty({ description: 'Access Id', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Access Id is required' })
  id: string;
}

export class AccessListingDto {
  @ApiProperty({ default: 1 })
  @IsNumber()
  page?: number;

  @ApiProperty({ default: 10 })
  @IsNumber()
  limit?: number;

  @ApiProperty({ description: 'Search...', required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ description: 'Status Filter', required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ description: 'Sort Field', required: false })
  @IsString()
  @IsOptional()
  sortField?: string;

  @ApiProperty({
    description: 'Sort Order',
    required: false,
    enum: ['asc', 'desc'],
  })
  @IsString()
  @IsOptional()
  sortOrder?: string;

  @ApiProperty({ description: 'Parent Access ID', required: false })
  @IsOptional()
  @IsMongoId({ message: 'ParentId must be a valid ObjectId' })
  parentId?: Types.ObjectId;

  @ApiProperty({ description: 'Impact Filter', required: false })
  @IsOptional()
  impact?: boolean;

  @ApiProperty({ description: 'Required Filter', required: false })
  @IsOptional()
  required?: boolean;
}

export class StatusAccessDto {
  @ApiProperty({
    description: 'Status',
    required: true,
    enum: ['Active', 'Inactive'],
  })
  @IsString()
  @IsNotEmpty({ message: 'Status is required' })
  @Matches(/^(Active|Inactive)$/, {
    message: 'Status must be either "Active" or "Inactive"',
  })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  status: string;

  @ApiProperty({ description: 'Access Id', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Access Id is required' })
  id: string;
}
