import mongoose from 'mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Model, PipelineStage, Types } from 'mongoose';

import { InjectModel } from '@nestjs/mongoose';
import { BaseRepository } from 'src/common/bases/base.repository';
import { User, UserDocument } from '../schemas/user.schema';
import { ListingFrontendUserDto, ListingUserDto } from '../dto/user.dto';
import { PaginationResponse } from 'src/common/types/api-response.type';

@Injectable()
export class UserRepository extends BaseRepository<UserDocument> {
  constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {
    super(UserModel);
  }

  async getUserDetailsJwtAuth(
    id: Types.ObjectId | string,
  ): Promise<UserDocument | null> {
    const user = await this.UserModel.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(id),
          isDeleted: false,
          status: 'Active',
        },
      },
      {
        $lookup: {
          from: 'roles',
          let: { roles: '$roles' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $in: ['$_id', '$$roles'] }],
                },
              },
            },
            {
              $project: {
                _id: '$_id',
                role: '$role',
                roleDisplayName: '$roleDisplayName',
                roleGroup: '$roleGroup',
                permissions: '$permissions',
              },
            },
          ],
          as: 'roles',
        },
      },
      {
        $project: {
          uid: '$uid',
          firstName: '$firstName',
          lastName: '$lastName',
          fullName: '$fullName',
          phone: '$phone',
          profileImage: '$profileImage',
          roles: {
            $map: {
              input: '$roles',
              as: 'role',
              in: {
                _id: '$$role._id',
                role: '$$role.role',
                roleGroup: '$$role.roleGroup',
                roleDisplayName: '$$role.roleDisplayName',
                permissions: '$$role.permissions',
              },
            },
          },
          email: '$email',
          status: '$status',
          user_devices: '$user_devices',
          tenantId: '$tenantId',
        },
      },
    ]);

    if (!user?.length) return null;
    return user[0];
  }

  async fineOneWithRole(
    params: Record<string, any>,
  ): Promise<UserDocument | null> {
    return await this.UserModel.findOne(params).populate('roles').exec();
  }

  async getUserDetails(
    params: Record<string, any>,
  ): Promise<UserDocument | null> {
    const aggregate = await this.UserModel.aggregate([
      { $match: params },
      {
        $lookup: {
          from: 'roles',
          let: { roles: '$roles' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $in: ['$_id', '$$roles'] }],
                },
              },
            },
            {
              $project: {
                _id: '$_id',
                role: '$role',
                roleDisplayName: '$roleDisplayName',
                roleGroup: '$roleGroup',
                permissions: '$permissions',
              },
            },
          ],
          as: 'roles',
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
        $project: {
          tenantId: 0,
          password: 0,
          isDeleted: 0,
          updatedAt: 0,
          countryCode: 0,
          emailOtp: 0,
          otpExpireTime: 0,
        },
      },
    ]);
    if (!aggregate?.length) return null;
    return aggregate[0];
  }

  async getAllPaginateFrontend(
    paginatedDto: ListingFrontendUserDto,
  ): Promise<PaginationResponse<UserDocument>> {
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
        $or: [
          { fullName: searchRegex },
          { email: searchRegex },
          { businessName: searchRegex },
        ],
      });
    }

    // Optional status filter
    if (paginatedDto.status) {
      and_clauses.push({ status: paginatedDto.status });
    }

    // Optional tenant filter
    if (paginatedDto.tenantId) {
      and_clauses.push({
        tenantId: { $eq: new Types.ObjectId(paginatedDto.tenantId) },
      });
    }

    // Optional role filter
    if (paginatedDto.roleIds) {
      and_clauses.push({
        roles: {
          $in: paginatedDto.roleIds.map((id) => new Types.ObjectId(id)),
        },
      });
    }

    // Optional sorting
    const sortField = paginatedDto.sortField || '_id'; // Default to sorting by _id if no field is provided
    const sortOrder = paginatedDto.sortOrder === 'asc' ? 1 : -1; // Default to descending order if not provided

    conditions['$and'] = and_clauses;

    const filterPipeline: PipelineStage[] = [
      { $match: conditions },
      {
        $lookup: {
          from: 'roles',
          let: { roles: '$roles' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $in: ['$_id', '$$roles'] }],
                },
              },
            },
            {
              $project: {
                _id: '$_id',
                role: '$role',
                roleDisplayName: '$roleDisplayName',
                roleGroup: '$roleGroup',
                permissions: '$permissions',
              },
            },
          ],
          as: 'roles',
        },
      },
      {
        $project: {
          fullName: 1,
          businessName: 1,
          email: 1,
          userName: 1,
          profileImage: 1,
          roles: 1,
          createdAt: 1,
          status: 1,
        },
      },
      { $sort: { [sortField]: sortOrder } },
      { $skip: skip },
      { $limit: +limit },
    ];

    const countPipeline: PipelineStage[] = [
      { $match: conditions },
      { $count: 'total' },
    ];

    // Perform the aggregation
    const [countResult, aggregate] = await Promise.all([
      this.UserModel.aggregate(countPipeline, { allowDiskUse: true })
        .exec()
        .catch((error) => {
          throw new InternalServerErrorException(
            `Error during count aggregation: ${error.message}`,
          );
        }),
      this.UserModel.aggregate(filterPipeline, { allowDiskUse: true })
        .exec()
        .catch((error) => {
          throw new InternalServerErrorException(
            `Error during data aggregation: ${error.message}`,
          );
        }),
    ]);

    const totalDocs = countResult.length ? countResult[0].total : 0;
    const hasMoreDocs = totalDocs > 0;
    const remainingDocs = totalDocs - (skip + aggregate.length) > 0;
    const hasNextPage = hasMoreDocs && remainingDocs;
    const hasPrevPage = page != 1;
    const totalPages = Math.ceil(totalDocs / limit);

    return {
      meta: {
        totalDocs: countResult.length ? countResult[0].total : 0,
        skip: skip,
        page: page,
        totalPages: totalPages,
        limit: limit,
        hasPrevPage,
        hasNextPage,
        prevPage: hasPrevPage ? page - 1 : null,
        nextPage: hasNextPage ? page + 1 : null,
      },
      docs: aggregate,
    };
  }

  async getListing(paginatedDto: ListingUserDto): Promise<UserDocument[]> {
    try {
      const conditions = {};
      const and_clauses: any[] = [];

      and_clauses.push({
        isDeleted: false,
        status: 'Active',
      });
      if (paginatedDto.roleIds) {
        and_clauses.push({
          roles: {
            $in: paginatedDto.roleIds.map((id) => new Types.ObjectId(id)),
          },
        });
      }

      if (paginatedDto.tenantId) {
        and_clauses.push({
          tenantId: { $eq: new Types.ObjectId(paginatedDto.tenantId) },
        });
      }

      if (paginatedDto.search) {
        const searchRegex = new RegExp(paginatedDto.search, 'i');
        and_clauses.push({
          $or: [
            { fullName: searchRegex },
            { email: searchRegex },
            { phone: searchRegex },
          ],
        });
      }

      conditions['$and'] = and_clauses;
      const aggregate = await this.UserModel.aggregate([
        { $match: conditions },
        {
          $project: {
            _id: 1,
            fullName: 1,
            email: 1,
            phone: 1,
            profileImage: 1,
          },
        },
        { $limit: 50 },
        { $sort: { _id: -1 } },
      ]);
      if (!aggregate?.length) return [];
      return aggregate;
    } catch (err) {
      throw err;
    }
  }
}
