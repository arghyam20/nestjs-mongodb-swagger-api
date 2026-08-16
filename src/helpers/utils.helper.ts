import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { NotificationRepository } from 'src/modules/notification/repositories';
import { RoleRepository } from 'src/modules/role/repositories/role.repository';
import { UserDeviceRepository } from 'src/modules/user-devices/repository/user-device.repository';
import { UserRepository } from 'src/modules/user/repositories/user.repository';
import { PushNotificationHelper } from './push-notification.helper';

@Injectable()
export class UtilsHelper {
  constructor(
    private notificationRepository: NotificationRepository,
    private userRepository: UserRepository,
    private readonly userDeviceRepository: UserDeviceRepository,
    private roleRepository: RoleRepository,
    private pushNotificationHelper: PushNotificationHelper,
  ) {}

  validPassword(pwd: string, hash: string) {
    return bcrypt.compareSync(pwd, hash);
  }

  generateHash(pwd: string) {
    return bcrypt.hashSync(
      pwd,
      bcrypt.genSaltSync(+(process.env.SALT_ROUND || 10)),
    );
  }

  getNamesFromBody(body: any) {
    if (body.fullName) {
      const splittedVal = body.fullName.trim().split(/\s+/);

      if (splittedVal.length === 1) {
        // Only one name provided
        body.firstName = splittedVal[0];
        body.lastName = '';
      } else if (splittedVal.length === 2) {
        // First and last name
        body.firstName = splittedVal[0];
        body.lastName = splittedVal[1];
      } else {
        // Multiple names - first name is first word, last name includes everything else
        body.firstName = splittedVal[0];
        body.lastName = splittedVal.slice(1).join(' '); // Join all remaining parts
      }

      body.fullName = (body.firstName + ' ' + body.lastName).trim();
    }

    if (body.firstName && body.lastName) {
      body.fullName = (body.firstName + ' ' + body.lastName).trim();
    }

    return body;
  }

  autoGeneratePassword(length: number = 12): string {
    const charset =
      'abcdefghijklmnopqrstuvwxyz' + // lowercase
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + // uppercase
      '0123456789' + // numbers
      '!@#$%^&*()_+[]{}|;:,.<>?'; // special chars

    let password = '';
    const charsetLength = charset.length;

    // Use crypto for better randomness
    const randomBytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      password += charset[randomBytes[i] % charsetLength];
    }

    return password;
  }

  async userNotification(body: any): Promise<boolean> {
    try {
      const receiveUser = await this.userRepository.getByField({
        _id: body.receiverUserId,
        isDeleted: false,
      });

      if (receiveUser?.isPushNotification === false) {
        return false;
      }

      const saveNotification = await this.notificationRepository.save(body);

      const subscriptions =
        await this.userDeviceRepository.getSubscriptionsByUserId(
          receiveUser?._id as any,
        );

      if (subscriptions.length) {
        for (const subscription of subscriptions) {
          this.pushNotificationHelper.sendWebPushNotification(
            subscription,
            saveNotification,
          );
        }
      }

      return true;
    } catch (error) {
      console.error('Error saving notification:', error);
      throw new Error('Failed to save notification');
    }
  }

  async getAdmin(): Promise<any> {
    const userRole = await this.roleRepository.getByField({ role: 'admin' });
    const adminData = await this.userRepository.getByField({
      role: userRole?._id as any,
      isDeleted: false,
      status: 'Active',
    });

    return adminData;
  }
}
