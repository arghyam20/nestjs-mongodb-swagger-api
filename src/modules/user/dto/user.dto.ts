import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class SaveFrontendUserDTO {
  @ApiProperty({ description: 'Email address', required: true })
  @Transform(
    ({ value }: TransformFnParams) => value?.trim() && value?.toLowerCase(),
  )
  @IsEmail({}, { message: 'Please enter a valid email!' })
  @IsNotEmpty({ message: 'Email address is required!' })
  email: string;

  @ApiProperty({ description: 'Full Name', required: true })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsNotEmpty({ message: 'Full Name is required!' })
  fullName: string;

  @ApiProperty({ description: 'Password', required: true })
  @IsString({ message: 'Value must be a string' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsNotEmpty({ message: 'Password is required!' })
  password: string;

  @ApiProperty({
    description: 'Profile image (jpg, png, jpeg)',
    type: 'file',
  })
  @IsOptional()
  profileImage: string;

  @ApiProperty({
    description: 'Role Types',
    required: true,
    example: '["admin","user"]',
  })
  @IsNotEmpty()
  @IsString()
  roleTypes: string;
}

export class ListingFrontendUserDto {
  @ApiProperty({ default: 1 })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiProperty({ default: 10 })
  @IsNumber()
  @IsOptional()
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

  @ApiProperty({ description: 'Tenant ID', required: false })
  @IsOptional()
  @IsMongoId()
  tenantId?: any;

  @ApiProperty({ description: 'Role IDs', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roleIds?: string[];

  @ApiProperty({
    description: 'Role Group',
    required: false,
    enum: ['admin', 'user'],
  })
  @IsOptional()
  @IsString()
  roleGroup?: string;
}

export class StatusUserDto {
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

  @ApiProperty({ description: 'User Id', required: true })
  @IsString()
  @IsNotEmpty({ message: 'User Id is required' })
  id: string;
}

export class UpdateFrontendUserDto {
  @ApiProperty({ description: 'Email address', required: true })
  @Transform(
    ({ value }: TransformFnParams) => value?.trim() && value?.toLowerCase(),
  )
  @IsEmail({}, { message: 'Please enter a valid email!' })
  @IsNotEmpty({ message: 'Email address is required!' })
  email: string;

  @ApiProperty({ description: 'Full Name', required: true })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsNotEmpty({ message: 'Full Name is required!' })
  fullName: string;

  @ApiProperty({
    description: 'Profile image (jpg, png, jpeg)',
    type: 'file',
  })
  @IsOptional()
  profileImage: string; // File to be uploaded via form-data

  @ApiProperty({
    description: 'Role Types',
    required: true,
    example: '["admin","user"]',
  })
  @IsNotEmpty()
  @IsString()
  roleTypes: string;

  @ApiProperty({ description: 'User Id', required: true })
  @IsString()
  @IsNotEmpty({ message: 'User Id is required' })
  id: string;

  @ApiProperty({
    description: 'Flag to indicate if profile image should be deleted',
    required: false,
    type: Boolean,
    default: false,
  })
  @IsOptional()
  @IsString()
  isImageDeleted: string;
}

export class ListingUserDto {
  @ApiProperty({ description: 'Search...', required: false })
  @IsString()
  @IsOptional()
  search: string;

  @ApiProperty({ description: 'Role IDs', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roleIds?: string[];

  @ApiProperty({ description: 'Tenant ID', required: false })
  @IsOptional()
  @IsMongoId()
  tenantId?: any;

  @ApiProperty({
    description: 'Role Group',
    required: false,
    enum: ['admin', 'user'],
  })
  @IsOptional()
  @IsString()
  roleGroup?: string;
}

export class UpdateUserDto {
  @ApiProperty({ description: 'Email address', required: true })
  @Transform(
    ({ value }: TransformFnParams) => value?.trim() && value?.toLowerCase(),
  )
  @IsEmail({}, { message: 'Please enter a valid email!' })
  @IsNotEmpty({ message: 'Email address is required!' })
  email: string;

  @ApiProperty({ description: 'Full Name', required: true })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsNotEmpty({ message: 'Full Name is required!' })
  fullName: string;

  @ApiPropertyOptional({ description: 'Phone No.' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Profile image (jpg, png, jpeg)',
    type: 'file',
  })
  @IsOptional()
  profileImage?: string;
}

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Current password is required' })
  currentPassword: string;

  @ApiProperty({ description: 'New password', required: true })
  @IsString()
  @IsNotEmpty({ message: 'New password is required' })
  password: string;
}

export class ProfileSettingsDTO {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isPushNotification: boolean;
}
