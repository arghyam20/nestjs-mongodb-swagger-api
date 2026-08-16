import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from '../schemas/role.schema';
import { PaginationResponse } from 'src/common/types/api-response.type';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Model, PipelineStage, Types } from 'mongoose';
import { BaseRepository } from 'src/common/bases/base.repository';
import { RoleListingDto } from '../dto/role.dto';

@Injectable()
export class RoleRepository extends BaseRepository<RoleDocument> {
  constructor(@InjectModel(Role.name) private RoleModel: Model<RoleDocument>) {
    super(RoleModel);
  }

  async getAllPaginate(
    paginatedDto: RoleListingDto,
  ): Promise<PaginationResponse<RoleDocument>> {
    const conditions = {};
    const and_clauses: any[] = [];

    const page = paginatedDto.page || 1;
    const limit = paginatedDto.limit || 10;
    const skip = (page - 1) * limit;

    and_clauses.push({
      isDeleted: false,
      role: { $nin: ['admin', 'super-admin'] },
    });

    if (paginatedDto.tenantId) {
      and_clauses.push({
        tenantId: { $eq: new Types.ObjectId(paginatedDto.tenantId) },
      });
    }

    // Optional search condition
    if (paginatedDto.search) {
      const searchRegex = new RegExp(paginatedDto.search, 'i'); // Case-insensitive search
      and_clauses.push({
        $or: [{ role: searchRegex }, { roleGroup: searchRegex }],
      });
    }

    // Optional status filter
    if (paginatedDto.status) {
      and_clauses.push({ status: paginatedDto.status });
    }

    if (paginatedDto.roleGroup) {
      and_clauses.push({ roleGroup: paginatedDto.roleGroup });
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
        $project: {
          role: 1,
          roleGroup: 1,
          roleDisplayName: 1,
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
      this.RoleModel.aggregate(countPipeline, { allowDiskUse: true })
        .exec()
        .catch((error) => {
          throw new InternalServerErrorException(
            `Error during count aggregation: ${error.message}`,
          );
        }),
      this.RoleModel.aggregate(filterPipeline, { allowDiskUse: true })
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
}
