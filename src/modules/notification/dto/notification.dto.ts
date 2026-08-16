import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class NotificationListingDto {
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

  @IsOptional()
  userId?: Types.ObjectId;
}

export class MarkReadStatusNotificationDto {
  @ApiProperty({ description: 'Notification Id', required: false })
  @IsString()
  @IsOptional()
  id: string;
}
