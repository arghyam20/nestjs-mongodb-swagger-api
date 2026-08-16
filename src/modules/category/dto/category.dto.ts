import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsMongoId,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { Types } from 'mongoose';

export class SaveCategoryDto {
  @ApiProperty({ description: 'Name of the category', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  name: string;

  @ApiProperty({ description: 'Slug of the category', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Slug is required' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  slug: string;

  @ApiProperty({
    description: 'Icon (jpg, png, jpeg)',
    type: 'file',
  })
  @IsOptional()
  icon: string;

  @ApiProperty({
    type: 'string',
    description: 'Parent category ID (optional)',
    required: false,
  })
  @IsOptional()
  @IsMongoId({ message: 'ParentId must be a valid ObjectId' })
  parentId?: Types.ObjectId; // Optional MongoDB ObjectId reference for the parent category
}

export class UpdateCategoryDto {
  @ApiProperty({ description: 'Name of the category', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  name: string;

  @ApiProperty({ description: 'Slug of the category', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Slug is required' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  slug: string;

  @ApiProperty({
    description: 'Icon (jpg, png, jpeg)',
    type: 'file',
  })
  @IsOptional()
  icon: string;

  @ApiProperty({
    type: 'string',
    description: 'Parent category ID (optional)',
    required: false,
  })
  @IsOptional()
  @IsMongoId({ message: 'ParentId must be a valid ObjectId' })
  parentId?: Types.ObjectId; // Optional MongoDB ObjectId reference for the parent category

  @ApiProperty({ description: 'Category Id', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Category Id is required' })
  id: string;
}

export class CategoryListingDto {
  @ApiProperty({ default: 1 })
  @IsNumber()
  page?: number;

  @ApiProperty({ default: 10 })
  @IsNumber()
  limit?: number;

  @ApiProperty({ description: 'Search...', required: false })
  @IsString()
  @IsOptional()
  search: string;

  @ApiProperty({ description: 'Status Filter', required: false })
  @IsString()
  @IsOptional()
  status: string;

  @ApiProperty({ description: 'Sort Field', required: false })
  @IsString()
  @IsOptional()
  sortField: string;

  @ApiProperty({
    description: 'Sort Order',
    required: false,
    enum: ['asc', 'desc'],
  })
  @IsString()
  @IsOptional()
  sortOrder: string;

  @ApiProperty({
    type: 'string',
    description: 'Parent category ID (optional)',
    required: false,
  })
  @IsOptional()
  @IsMongoId({ message: 'ParentId must be a valid ObjectId' })
  parentId?: Types.ObjectId; // Optional MongoDB ObjectId reference for the parent category
}

export class StatusCategoryDto {
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

  @ApiProperty({ description: 'Category Id', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Category Id is required' })
  id: string;
}
