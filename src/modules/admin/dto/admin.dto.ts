import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateAdminUserDto {
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
}

export class ChangeAdminPasswordDto {
  @ApiProperty({ description: 'Current password', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Current password is required' })
  currentPassword: string;

  @ApiProperty({ description: 'New password', required: true })
  @IsString()
  @IsNotEmpty({ message: 'New password is required' })
  password: string;
}
