import { HttpStatus, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { ApiResponse } from 'src/common/types/api-response.type';
import { CategoryRepository } from 'src/modules/category/repositories/category.repository';
import { UserDocument } from '../user/schemas/user.schema';

@Injectable()
export class CategoryApiService {
  constructor(private categoryRepository: CategoryRepository) {}

  async list(
    _user?: Partial<UserDocument>,
    parentId?: string,
  ): Promise<ApiResponse> {
    const query: any = {
      isDeleted: false,
      status: 'Active',
      parentId: parentId ? new Types.ObjectId(parentId) : null,
    };

    const list =
      await this.categoryRepository.getCategoriesWithActiveForms(query);
    return {
      statusCode: HttpStatus.OK,
      message: 'Category list retrieved successfully.',
      data: list,
    };
  }
}
