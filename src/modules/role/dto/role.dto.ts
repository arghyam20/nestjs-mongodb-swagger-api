import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';

export class PermissionAccessDto {
  @ApiProperty({ type: Boolean, default: false })
  @IsBoolean()
  read: boolean;

  @ApiProperty({ type: Boolean, default: false })
  @IsBoolean()
  write: boolean;

  @ApiProperty({ type: Boolean, default: false })
  @IsBoolean()
  edit: boolean;

  @ApiProperty({ type: Boolean, default: false })
  @IsBoolean()
  delete: boolean;
}

export class PermissionItemDto {
  @ApiProperty({ description: 'Access Name' })
  @IsString()
  access_name: string;

  @ApiProperty({ description: 'Access Slug' })
  @IsString()
  access_slug: string;

  @ApiProperty({ type: PermissionAccessDto })
  @ValidateNested()
  @Type(() => PermissionAccessDto)
  permission: PermissionAccessDto;
}

export class RoleListingDto {
  @ApiProperty({ description: 'Role Group', enum: ['admin', 'user'] })
  @IsOptional()
  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  roleGroup: string;

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

  @ApiProperty({ description: 'Tenant ID', required: false })
  @IsOptional()
  @IsMongoId()
  tenantId?: any;
}

export class SaveRoleDto {
  @ApiProperty({ description: 'Role', required: true })
  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsNotEmpty({ message: 'Role is required' })
  role: string;

  @ApiProperty({
    description: 'Role Group',
    required: true,
    enum: ['admin', 'user'],
  })
  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsNotEmpty({ message: 'Role Group is required' })
  roleGroup: string;

  @ApiProperty({ description: 'Role Display Name', required: true })
  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsNotEmpty({ message: 'Role Display Name is required' })
  roleDisplayName: string;

  @ApiProperty({ type: [PermissionItemDto], required: false })
  @IsOptional()
  @IsArray()
  @Type(() => PermissionItemDto)
  permissions?: PermissionItemDto[];

  @ApiProperty({ description: 'Tenant ID', required: false })
  @IsOptional()
  @IsMongoId()
  tenantId?: any;
}

export class UpdateRoleDto {
  @ApiProperty({ description: 'Role', required: true })
  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsNotEmpty({ message: 'Role is required' })
  role: string;

  @ApiProperty({
    description: 'Role Group',
    required: true,
    enum: ['admin', 'user'],
  })
  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsNotEmpty({ message: 'Role Group is required' })
  roleGroup: string;

  @ApiProperty({ description: 'Role Display Name', required: true })
  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsNotEmpty({ message: 'Role Display Name is required' })
  roleDisplayName: string;

  @ApiProperty({ type: [PermissionItemDto], required: false })
  @IsOptional()
  @IsArray()
  @Type(() => PermissionItemDto)
  permissions?: PermissionItemDto[];

  @ApiProperty({ description: 'Role Id', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Role Id is required' })
  id: string;
}

export class StatusRoleDto {
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

  @ApiProperty({ description: 'Role Id', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Role Id is required' })
  id: string;
}
