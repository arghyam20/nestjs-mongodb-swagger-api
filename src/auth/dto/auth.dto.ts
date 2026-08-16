import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class RefreshJwtDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Access token to reach private urls' })
  accessToken: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'Token to refresh whole pair' })
  refreshToken: string;
}

export class UserSignInDTO {
  @ApiProperty({ description: 'Email', required: true })
  @IsString({ message: 'Value must be a string' })
  @Transform(({ value }: TransformFnParams) => value?.trim()?.toLowerCase())
  @IsNotEmpty({ message: 'Email is required!' })
  email: string;

  @ApiProperty({ description: 'Password', required: true })
  @IsString({ message: 'Value must be a string' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsNotEmpty({ message: 'Password is required!' })
  password: string;

  @ApiPropertyOptional({ description: 'Device Token' })
  @IsOptional()
  @IsNotEmpty({ message: 'Device token should not be empty!' })
  @Transform(({ value }: TransformFnParams) =>
    typeof value === 'string' ? value.trim() : String(value),
  )
  deviceToken?: string;

  @ApiPropertyOptional({
    type: Object,
    description: 'Web Push subscription data (endpoint, keys, etc.)',
    example: {
      endpoint: 'https://fcm.googleapis.com/fcm/send/xxxx',
      expirationTime: null,
      keys: {
        p256dh: 'BASE64_ENCODED_KEY',
        auth: 'BASE64_AUTH_KEY',
      },
    },
  })
  @IsOptional()
  @IsObject()
  webPush?: Record<string, any>;
}

export class ForgotPasswordDTO {
  @ApiProperty({ description: 'Email address', required: true })
  @Transform(({ value }: TransformFnParams) => value?.trim()?.toLowerCase())
  @IsEmail({}, { message: 'Please enter a valid email!' })
  @IsNotEmpty({ message: 'Email address is required!' })
  email: string;

  @ApiProperty({ description: 'Base URL', required: true })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsNotEmpty({ message: 'Base URL is required!' })
  baseUrl: string;
}

export class ResetPasswordDTO {
  @ApiProperty({ description: 'New password', required: true })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsNotEmpty({ message: 'New password is required!' })
  newPassword: string;

  @ApiProperty({ description: 'Authorization token', required: true })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsNotEmpty({ message: 'Authorization token is required!' })
  authToken: string;
}
