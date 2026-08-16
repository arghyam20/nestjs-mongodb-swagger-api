import { HttpStatus, Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { ApiResponse } from 'src/common/types/api-response.type';
import {
  MarkReadStatusNotificationDto,
  NotificationListingDto,
} from 'src/modules/notification/dto/notification.dto';
import { NotificationRepository } from 'src/modules/notification/repositories/notification.repository';
import { UserDocument } from '../user/schemas/user.schema';

@Injectable()
export class NotificationAdminService {
  constructor(private notificationRepository: NotificationRepository) {}

  async getAll(
    body: NotificationListingDto,
    user: Partial<UserDocument>,
  ): Promise<ApiResponse> {
    body.userId = user._id;
    const getAllNotification =
      await this.notificationRepository.getAllPaginate(body);

    const unReadCount = await this.notificationRepository.getCountByParam({
      receiverUserId: user._id,
      isRead: false,
      isDeleted: false,
      status: 'Active',
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Notification fetched successfully.',
      data: { getAll: getAllNotification, unReadCount: unReadCount },
    };
  }

  async readStatusUpdate(
    body: MarkReadStatusNotificationDto,
    user: Partial<UserDocument>,
  ): Promise<ApiResponse> {
    if (body?.id) {
      const readNotification = await this.notificationRepository.updateById(
        { isRead: true, readAt: new Date() },
        body.id,
      );
      if (readNotification) {
        return {
          statusCode: HttpStatus.OK,
          message: 'Notification has been read Successfully!',
        };
      } else {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Something went wrong.',
        };
      }
    } else {
      await this.notificationRepository.updateAllByParams(
        { isRead: true, readAt: new Date() },
        { receiverUserId: user._id },
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Notification has been read Successfully!',
      };
    }
  }

  async delete(id: string): Promise<ApiResponse> {
    if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid ID format.',
      };
    }

    const deleteData = await this.notificationRepository.updateById(
      { isDeleted: true },
      id,
    );

    if (deleteData) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Notification deleted successfully.',
      };
    } else {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Something went wrong.',
      };
    }
  }
}
