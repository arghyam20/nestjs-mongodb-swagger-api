import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import mongoose, { Types } from 'mongoose';
import { ApiResponse } from 'src/common/types/api-response.type';
import {
  CategoryListingDto,
  SaveCategoryDto,
  StatusCategoryDto,
  UpdateCategoryDto,
} from 'src/modules/category/dto/category.dto';
import { CategoryRepository } from 'src/modules/category/repositories/category.repository';
import { deleteFileFromServer } from 'src/common/interceptors/files.interceptor';
import { UserDocument } from '../user/schemas/user.schema';

@Injectable()
export class CategoryAdminService {
  constructor(private categoryRepository: CategoryRepository) {}

  async getAll(body: CategoryListingDto): Promise<ApiResponse> {
    const getAllCategories = await this.categoryRepository.getAllPaginate(body);

    if (getAllCategories) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Category fetched successfully.',
        data: getAllCategories,
      };
    } else {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Something went wrong.',
      };
    }
  }

  async save(
    body: SaveCategoryDto,
    files: any,
    user: Partial<UserDocument>,
  ): Promise<ApiResponse> {
    // Check if the question already exists
    const existingCategory = await this.categoryRepository.getByField({
      name: body.name,
      isDeleted: false,
    });

    if (existingCategory) {
      return {
        statusCode: HttpStatus.CONFLICT,
        message: 'This category already exists.',
      };
    }

    if (files?.length) {
      body.icon = files[0].key;
    }

    const payload: any = {
      ...body,
      userId: user._id,
    };

    if (body.parentId) {
      payload.parentId = new Types.ObjectId(body.parentId);
      payload.tenantId = user.tenantId;
    }

    const saveCategory = await this.categoryRepository.save(payload);
    if (saveCategory && saveCategory._id) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Category saved successfully.',
        data: saveCategory,
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

    const category = await this.categoryRepository.getByField({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    });

    if (!category) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Category not found.',
      };
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Category retrieved successfully.',
      data: category,
    };
  }

  async update(body: UpdateCategoryDto, files: any): Promise<ApiResponse> {
    const existingCategory = await this.categoryRepository.getByField({
      name: body.name,
      isDeleted: false,
      _id: { $ne: body.id },
    });

    if (existingCategory) {
      throw new BadRequestException(
        'A category with this name already exists.',
      );
    }

    const categoryToUpdate = await this.categoryRepository.getById(body.id);
    if (!categoryToUpdate) {
      throw new BadRequestException('Category not found.');
    }

    if (files?.length) {
      body.icon = files[0].key;

      if (categoryToUpdate.icon) {
        deleteFileFromServer(categoryToUpdate.icon);
      }
    }

    let updatedValue = {};

    // Merge with the new object containing other fields
    updatedValue = {
      ...updatedValue, // Retain the icon if set
      name: body.name,
      icon: body.icon ? body.icon : categoryToUpdate.icon,
      parentId: body.parentId ? new Types.ObjectId(body.parentId) : null,
    };

    const updatedCategory = await this.categoryRepository.updateById(
      updatedValue,
      body.id,
    );

    if (updatedCategory && updatedCategory._id) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Category updated successfully.',
        data: updatedCategory,
      };
    } else {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Something went wrong.',
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

    const deleteData = await this.categoryRepository.updateById(
      { isDeleted: true },
      id,
    );

    if (deleteData) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Category deleted successfully.',
      };
    } else {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Something went wrong.',
      };
    }
  }

  async statusUpdate(body: StatusCategoryDto): Promise<ApiResponse> {
    const updatedValue = {
      status: body.status,
    };

    // Save new Category if the question doesn't exist
    const updateStatus = await this.categoryRepository.updateById(
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

  async list(
    user?: Partial<UserDocument>,
    parentId?: string,
    assign?: string,
  ): Promise<ApiResponse> {
    const query: any = {
      isDeleted: false,
      status: 'Active',
      parentId: parentId ? new Types.ObjectId(parentId) : null,
    };

    let assignFilter: boolean | null = null;
    if (assign === 'true') assignFilter = true;
    else if (assign === 'false') assignFilter = false;

    const list = await this.categoryRepository.getAllCustom(
      query,
      user?._id?.toString() as string,
      assignFilter,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Category list retrieved successfully.',
      data: list,
    };
  }
}
