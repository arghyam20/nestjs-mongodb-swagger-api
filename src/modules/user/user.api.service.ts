import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { ApiResponse } from 'src/common/types/api-response.type';
import {
  ChangePasswordDto,
  ProfileSettingsDTO,
  UpdateUserDto,
} from './dto/user.dto';
import { UserRepository } from './repositories/user.repository';
import { UtilsHelper } from 'src/helpers/utils.helper';
import { UserDocument } from './schemas/user.schema';
import { deleteFileFromServer } from 'src/common/interceptors/files.interceptor';

@Injectable()
export class UserApiService {
  constructor(
    private userRepository: UserRepository,
    private utilsHelper: UtilsHelper,
  ) {}

  async profileDetails(user: Partial<UserDocument>): Promise<ApiResponse> {
    if (!user) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Profile details not found.',
      };
    }

    const userDetails = await this.userRepository.getUserDetails({
      _id: new mongoose.Types.ObjectId(user._id as any),
      isDeleted: false,
    });

    return {
      statusCode: HttpStatus.OK,
      message: 'Profile details retrieved successfully.',
      data: userDetails as any,
    };
  }

  async updateAdminUser(
    body: UpdateUserDto,
    files: any,
    user: Partial<UserDocument>,
  ): Promise<ApiResponse> {
    const userDetails = await this.userRepository.getByField({
      _id: new mongoose.Types.ObjectId(user._id as any),
      isDeleted: false,
    });
    if (!userDetails?._id) throw new BadRequestException('User not found!');

    const isEmailExists = await this.userRepository.getByField({
      email: { $regex: '^' + body.email + '$', $options: 'i' },
      isDeleted: false,
      _id: { $ne: userDetails._id },
    });
    if (isEmailExists?._id)
      throw new BadRequestException('User with this email already exists!');

    if (body.phone) {
      const isPhoneExists = await this.userRepository.getByField({
        phone: { $regex: '^' + body.phone + '$', $options: 'i' },
        isDeleted: false,
        _id: { $ne: userDetails._id },
      });
      if (isPhoneExists?._id)
        throw new BadRequestException('User with this phone already exists!');
    }

    if (files?.length) {
      body.profileImage = files[0].key;

      if (userDetails.profileImage) {
        deleteFileFromServer(userDetails.profileImage);
      }
    }

    body = this.utilsHelper.getNamesFromBody(body);

    const updateUser = await this.userRepository.updateById(
      body,
      userDetails._id,
    );
    if (updateUser && updateUser._id) {
      return {
        statusCode: HttpStatus.OK,
        message: 'User updated successfully.',
        data: updateUser,
      };
    } else {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Something went wrong.',
      };
    }
  }

  async changePassword(
    body: ChangePasswordDto,
    user: Partial<UserDocument>,
  ): Promise<ApiResponse> {
    const userData = await this.userRepository.getAllByFieldWithProjection(
      { _id: user._id, isDeleted: false },
      {
        password: 1,
      },
    );

    if (!userData) {
      throw new BadRequestException('User is not found!');
    }

    const oldPasswordMatch = this.utilsHelper.validPassword(
      body.currentPassword,
      userData[0].password,
    );
    if (!oldPasswordMatch) {
      throw new BadRequestException('Current password is not match');
    }

    const newPassVsOldPass = this.utilsHelper.validPassword(
      body.password,
      userData[0].password,
    );
    if (newPassVsOldPass) {
      throw new BadRequestException(
        'New password cannot be same as your old password!',
      );
    }

    const pwd = body.password;
    body.password = this.utilsHelper.generateHash(pwd);
    const userUpdate = await this.userRepository.updateById(
      body,
      user._id as any,
    );
    if (userUpdate && userUpdate._id) {
      return {
        statusCode: HttpStatus.OK,
        message: 'User password updated successfully.',
        data: userUpdate,
      };
    } else {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Password not updated.',
      };
    }
  }

  async settingUpdate(
    body: ProfileSettingsDTO,
    user: Partial<UserDocument>,
  ): Promise<ApiResponse> {
    const userUpdate = await this.userRepository.updateById(
      body,
      user._id as any,
    );
    if (userUpdate && userUpdate._id) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Setting updated successfully.',
        data: userUpdate,
      };
    } else {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Setting not updated.',
      };
    }
  }
}
