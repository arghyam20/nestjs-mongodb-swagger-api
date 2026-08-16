import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { ApiResponse } from 'src/common/types/api-response.type';
import { AccessRepository } from './repositories';
import {
  AccessListingDto,
  SaveAccessDto,
  StatusAccessDto,
  UpdateAccessDto,
} from './dto/access.dto';

@Injectable()
export class AccessAdminService {
  constructor(private accessRepository: AccessRepository) {}

  async getAll(body: AccessListingDto): Promise<ApiResponse> {
    const data = await this.accessRepository.getAllPaginate(body);
    return {
      statusCode: HttpStatus.OK,
      message: 'Access data fetched successfully.',
      data,
    };
  }

  async save(body: SaveAccessDto): Promise<ApiResponse> {
    const existing = await this.accessRepository.getByField({
      slug: body.slug,
      isDeleted: false,
    });

    if (existing) {
      return {
        statusCode: HttpStatus.CONFLICT,
        message: 'Access with this slug already exists.',
      };
    }

    const saved = await this.accessRepository.save(body);
    if (saved?._id) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Access saved successfully.',
        data: saved,
      };
    }
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Something went wrong.',
    };
  }

  async get(id: string): Promise<ApiResponse> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid ID format.',
      };
    }

    const access = await this.accessRepository.getByField({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    });

    if (!access) {
      return { statusCode: HttpStatus.NOT_FOUND, message: 'Access not found.' };
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Access retrieved successfully.',
      data: access,
    };
  }

  async update(body: UpdateAccessDto): Promise<ApiResponse> {
    const existing = await this.accessRepository.getByField({
      slug: body.slug,
      isDeleted: false,
      _id: { $ne: body.id },
    });

    if (existing) {
      throw new BadRequestException('Access with this slug already exists.');
    }

    const updated = await this.accessRepository.updateById(
      {
        name: body.name,
        slug: body.slug,
        description: body.description,
        parentId: body.parentId ?? null,
        impact: body.impact ?? false,
        required: body.required ?? false,
      },
      body.id,
    );

    if (updated?._id) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Access updated successfully.',
        data: updated,
      };
    }
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Something went wrong.',
    };
  }

  async statusUpdate(body: StatusAccessDto): Promise<ApiResponse> {
    const updated = await this.accessRepository.updateById(
      { status: body.status },
      body.id,
    );
    if (updated?._id) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Status updated successfully.',
        data: updated,
      };
    }
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Something went wrong.',
    };
  }

  async delete(id: string): Promise<ApiResponse> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid ID format.',
      };
    }

    const deleted = await this.accessRepository.updateById(
      { isDeleted: true },
      id,
    );
    if (deleted) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Access deleted successfully.',
      };
    }
    return {
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Something went wrong.',
    };
  }

  async listing(): Promise<ApiResponse> {
    const data = await this.accessRepository.getAllCustom();
    return {
      statusCode: HttpStatus.OK,
      message: 'Access data fetched successfully.',
      data,
    };
  }
}
