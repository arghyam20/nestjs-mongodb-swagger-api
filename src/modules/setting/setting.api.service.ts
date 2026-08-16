import { HttpStatus, Injectable, BadRequestException } from '@nestjs/common';
import mongoose from 'mongoose';
import { ApiResponse } from 'src/common/types/api-response.type';
import { UpdateSettingDto } from 'src/modules/setting/dto/setting.dto';
import { SettingRepository } from 'src/modules/setting/repositories/setting.repository';

@Injectable()
export class SettingServiceApi {
  constructor(private settingRepository: SettingRepository) {}

  async get(): Promise<ApiResponse> {
    const cms = await this.settingRepository.findSettingCms();

    if (!cms) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Setting Data not found.',
      };
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Setting Data retrieved successfully.',
      data: cms,
    };
  }

  async update(body: UpdateSettingDto): Promise<ApiResponse> {
    const settingDetails = await this.settingRepository.getByField({
      _id: new mongoose.Types.ObjectId(body.id),
      isDeleted: false,
    });
    if (!settingDetails?._id)
      throw new BadRequestException('Setting Data not found!');

    // Save new Setting if the firstName doesn't exist
    const updateSetting = await this.settingRepository.updateById(
      body,
      body.id,
    );

    if (updateSetting && updateSetting._id) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Setting Data updated successfully.',
        data: updateSetting,
      };
    } else {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Something went wrong.',
      };
    }
  }
}
