import { HttpStatus, Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { ApiResponse } from 'src/common/types/api-response.type';
import {
  CmsListingDto,
  StatusCmsDto,
  UpdateCmsDto,
} from 'src/modules/cms/dto/cms.dto';
import { CmsRepository } from 'src/modules/cms/repositories/cms.repository';

@Injectable()
export class CmsAdminService {
  constructor(private cmsRepository: CmsRepository) {}

  async getAll(body: CmsListingDto): Promise<ApiResponse> {
    const getAllCmss = await this.cmsRepository.getAllPaginate(body);

    if (getAllCmss) {
      return {
        statusCode: HttpStatus.OK,
        message: 'CMS data fetched successfully.',
        data: getAllCmss,
      };
    } else {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Something went wrong.',
      };
    }
  }

  async get(id: string): Promise<ApiResponse> {
    if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid ID format.',
      };
    }

    const cms = await this.cmsRepository.getByField({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    });

    if (!cms) {
      return { statusCode: HttpStatus.NOT_FOUND, message: 'CMS not found.' };
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'CMS retrieved successfully.',
      data: cms,
    };
  }

  async update(body: UpdateCmsDto): Promise<ApiResponse> {
    // Check if the question already exists
    const existingCms = await this.cmsRepository.getByField({
      title: body.title,
      isDeleted: false,
      _id: { $ne: body.id },
    });

    if (existingCms) {
      return {
        statusCode: HttpStatus.CONFLICT,
        message: 'This question already exists.',
      };
    }

    const updatedValue = {
      title: body.title,
      content: body.content,
    };

    // Save new CMS if the question doesn't exist
    const updateCms = await this.cmsRepository.updateById(
      updatedValue,
      body.id,
    );

    if (updateCms && updateCms._id) {
      return {
        statusCode: HttpStatus.OK,
        message: 'CMS updated successfully.',
        data: updateCms,
      };
    } else {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Something went wrong.',
      };
    }
  }

  async statusUpdate(body: StatusCmsDto): Promise<ApiResponse> {
    const updatedValue = {
      status: body.status,
    };

    // Save new CMS if the question doesn't exist
    const updateStatus = await this.cmsRepository.updateById(
      updatedValue,
      body.id,
    );

    if (updateStatus && updateStatus._id) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Status updated successfully.',
        data: updateStatus,
      };
    } else {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Something went wrong.',
      };
    }
  }
}
