import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';

export class UpdateSettingDto {
  @ApiProperty({ description: 'Setting Id', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Setting Id is required' })
  id: string;

  @ApiProperty({ description: 'Email', required: true })
  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ description: 'Phone', required: true })
  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsNotEmpty({ message: 'Phone is required' })
  phone: string;

  @ApiProperty({ description: 'Address', required: true })
  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  @IsNotEmpty({ message: 'Address is required' })
  address: string;
}
