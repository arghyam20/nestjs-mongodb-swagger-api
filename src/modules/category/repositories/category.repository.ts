import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Category, CategoryDocument } from '../schemas/category.schema';
import { PaginationResponse } from 'src/common/types/api-response.type';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Model, PipelineStage, Types } from 'mongoose';

import { BaseRepository } from 'src/common/bases/base.repository';
import { CategoryListingDto } from '../dto/category.dto';

@Injectable()
export class CategoryRepository extends BaseRepository<CategoryDocument> {
  constructor(
    @InjectModel(Category.name)
    private CategoryModel: Model<CategoryDocument>,
  ) {
    super(CategoryModel);
  }

  async getAllPaginate(
    paginatedDto: CategoryListingDto,
  ): Promise<PaginationResponse<CategoryDocument>> {
    const conditions = {};
    const and_clauses: any[] = [];

    const page = paginatedDto.page || 1;
    const limit = paginatedDto.limit || 10;
    const skip = (page - 1) * limit;

    and_clauses.push({ isDeleted: false });

    // Optional search condition
    if (paginatedDto.search) {
      const searchRegex = new RegExp(paginatedDto.search, 'i'); // Case-insensitive search
      and_clauses.push({
        $or: [{ name: searchRegex }],
      });
    }

    if (!paginatedDto.parentId) {
      and_clauses.push({ parentId: { $eq: null } });
    }

    if (paginatedDto.parentId) {
      and_clauses.push({
        parentId: { $eq: new Types.ObjectId(paginatedDto.parentId) },
      });
    }

    // Optional status filter
    if (paginatedDto.status) {
      and_clauses.push({ status: paginatedDto.status });
    }

    // Optional sorting
    const sortField = paginatedDto.sortField || '_id'; // Default to sorting by _id if no field is provided
    const sortOrder = paginatedDto.sortOrder === 'asc' ? 1 : -1; // Default to descending order if not provided

    conditions['$and'] = and_clauses;

    const filterPipeline: PipelineStage[] = [
      { $match: conditions },
      { $skip: skip },
      { $limit: +limit },
      {
        $lookup: {
          from: 'categories',
          let: { parentId: '$parentId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', '$$parentId'] },
                    { $eq: ['$isDeleted', false] },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                slug: 1,
              },
            },
          ],
          as: 'categoryData',
        },
      },
      {
        $unwind: {
          path: '$categoryData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'tenants',
          let: { tenantId: '$tenantId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', '$$tenantId'] },
                    { $eq: ['$isDeleted', false] },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                slug: 1,
              },
            },
          ],
          as: 'tenantData',
        },
      },
      {
        $unwind: {
          path: '$tenantData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          let: { userId: '$userId' },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$userId'] } } },
            {
              $project: {
                _id: 1,
                fullName: 1,
                email: 1,
                phone: 1,
                profileImage: 1,
              },
            },
          ],
          as: 'userData',
        },
      },
      { $unwind: { path: '$userData', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'categories',
          let: { categoryId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$parentId', '$$categoryId'] },
                    { $eq: ['$isDeleted', false] },
                    { $eq: ['$status', 'Active'] },
                  ],
                },
              },
            },
            { $limit: 1 },
            { $project: { _id: 1 } },
          ],
          as: 'children',
        },
      },
      {
        $addFields: {
          hasChild: { $gt: [{ $size: '$children' }, 0] },
        },
      },
      {
        $project: {
          name: 1,
          icon: 1,
          parentId: 1,
          createdAt: 1,
          hasChild: 1,
          categoryData: 1,
          tenantData: 1,
          userData: 1,
          status: 1,
        },
      },
      { $sort: { [sortField]: sortOrder } }, // Dynamic sorting
    ];

    const countPipeline: PipelineStage[] = [
      { $match: conditions },
      { $count: 'total' },
    ];

    // Perform the aggregation
    const [countResult, aggregate] = await Promise.all([
      this.CategoryModel.aggregate(countPipeline, { allowDiskUse: true })
        .exec()
        .catch((error) => {
          throw new InternalServerErrorException(
            `Error during count aggregation: ${error.message}`,
          );
        }),
      this.CategoryModel.aggregate(filterPipeline, {
        allowDiskUse: true,
      })
        .exec()
        .catch((error) => {
          throw new InternalServerErrorException(
            `Error during data aggregation: ${error.message}`,
          );
        }),
    ]);

    const hasNextPage =
      (countResult.length ? countResult[0].total : 0) > 0 &&
      countResult[0].total - (skip + aggregate.length) > 0
        ? true
        : false;
    const hasPrevPage = page != 1;
    const totalDocs = countResult.length ? countResult[0].total : 0;
    const totalPages = Math.ceil(totalDocs / limit);

    return {
      meta: {
        totalDocs: totalDocs,
        skip: skip,
        page: page,
        limit: limit,
        totalPages: totalPages,
        hasPrevPage,
        hasNextPage,
        prevPage: hasPrevPage ? page - 1 : null,
        nextPage: hasNextPage ? page + 1 : null,
      },
      docs: aggregate,
    };
  }

  async getAllCustom(
    params: Record<string, any>,
    userId: string,
    assignFilter: boolean | null = null,
  ): Promise<CategoryDocument[]> {
    try {
      const pipeline: any[] = [
        { $match: params },
        {
          $lookup: {
            from: 'categories',
            let: { parentId: '$parentId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$_id', '$$parentId'] },
                      { $eq: ['$isDeleted', false] },
                    ],
                  },
                },
              },
              { $project: { _id: 1, name: 1, slug: 1 } },
            ],
            as: 'categoryData',
          },
        },
        {
          $unwind: {
            path: '$categoryData',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'categories',
            let: { categoryId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$parentId', '$$categoryId'] },
                      { $eq: ['$isDeleted', false] },
                      { $eq: ['$status', 'Active'] },
                    ],
                  },
                },
              },
              { $limit: 1 },
              { $project: { _id: 1 } },
            ],
            as: 'children',
          },
        },
        {
          $lookup: {
            from: 'category_assigns',
            let: {
              categoryId: '$parentId',
              subCategoryId: '$_id',
              userId: new Types.ObjectId(userId),
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$userId', '$$userId'] },
                      { $eq: ['$categoryId', '$$categoryId'] },
                      { $eq: ['$subCategoryId', '$$subCategoryId'] },
                      { $eq: ['$isDeleted', false] },
                      { $eq: ['$status', 'Active'] },
                    ],
                  },
                },
              },
              { $limit: 1 },
              { $project: { _id: 1 } },
            ],
            as: 'assigned',
          },
        },
        {
          $addFields: {
            hasChild: { $gt: [{ $size: '$children' }, 0] },
            isAssigned: { $gt: [{ $size: '$assigned' }, 0] },
          },
        },
      ];

      if (assignFilter !== null) {
        pipeline.push({
          $match: { isAssigned: assignFilter },
        });
      }

      pipeline.push({
        $project: {
          updatedAt: 0,
          createdAt: 0,
          isDeleted: 0,
          children: 0,
          // assigned: 0,
        },
      });

      const aggregate = await this.CategoryModel.aggregate(pipeline);
      if (!aggregate?.length) return [];
      return aggregate;
    } catch (err) {
      throw err;
    }
  }

  async getCategoriesWithActiveForms(
    params: Record<string, any>,
  ): Promise<CategoryDocument[]> {
    try {
      const aggregate = await this.CategoryModel.aggregate([
        { $match: params },
        {
          $lookup: {
            from: 'categories',
            let: { parentId: '$parentId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$_id', '$$parentId'] },
                      { $eq: ['$isDeleted', false] },
                    ],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  name: 1,
                  slug: 1,
                },
              },
            ],
            as: 'categoryData',
          },
        },
        {
          $unwind: {
            path: '$categoryData',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'categories',
            let: { categoryId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$parentId', '$$categoryId'] },
                      { $eq: ['$isDeleted', false] },
                      { $eq: ['$status', 'Active'] },
                    ],
                  },
                },
              },
              { $limit: 1 },
              { $project: { _id: 1 } },
            ],
            as: 'children',
          },
        },
        {
          $lookup: {
            from: 'dynamic_forms',
            let: { categoryId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$categoryId', '$$categoryId'] },
                      { $eq: ['$status', 'Active'] },
                      { $eq: ['$isDeleted', false] },
                    ],
                  },
                },
              },
              { $limit: 1 },
              { $project: { _id: 1 } },
            ],
            as: 'formsByCategory',
          },
        },
        {
          $lookup: {
            from: 'dynamic_forms',
            let: { subCategoryId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$subCategoryId', '$$subCategoryId'] },
                      { $eq: ['$status', 'Active'] },
                      { $eq: ['$isDeleted', false] },
                    ],
                  },
                },
              },
              { $limit: 1 },
              { $project: { _id: 1 } },
            ],
            as: 'formsBySubCategory',
          },
        },
        {
          $addFields: {
            hasChild: { $gt: [{ $size: '$children' }, 0] },
            hasActiveForm: {
              $gt: [
                {
                  $size: {
                    $concatArrays: ['$formsByCategory', '$formsBySubCategory'],
                  },
                },
                0,
              ],
            },
          },
        },
        {
          $match: {
            hasActiveForm: true,
          },
        },
        {
          $project: {
            updatedAt: 0,
            createdAt: 0,
            isDeleted: 0,
            children: 0,
            hasActiveForm: 0,
            formsByCategory: 0,
            formsBySubCategory: 0,
          },
        },
      ]);

      if (!aggregate?.length) return [];
      return aggregate;
    } catch (err) {
      throw err;
    }
  }
}
