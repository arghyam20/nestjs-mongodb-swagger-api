import { InjectModel } from '@nestjs/mongoose';
import { Access, AccessDocument } from '../schemas/access.schema';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Model, PipelineStage, Types } from 'mongoose';
import { BaseRepository } from 'src/common/bases/base.repository';
import { AccessListingDto } from '../dto/access.dto';
import { PaginationResponse } from 'src/common/types/api-response.type';

@Injectable()
export class AccessRepository extends BaseRepository<AccessDocument> {
  constructor(
    @InjectModel(Access.name) private AccessModel: Model<AccessDocument>,
  ) {
    super(AccessModel);
  }

  async getAllPaginate(
    paginatedDto: AccessListingDto,
  ): Promise<PaginationResponse<AccessDocument>> {
    const page = paginatedDto.page || 1;
    const limit = paginatedDto.limit || 10;
    const skip = (page - 1) * limit;
    const and_clauses: any[] = [{ isDeleted: false }];

    if (paginatedDto.search) {
      const searchRegex = new RegExp(paginatedDto.search, 'i');
      and_clauses.push({ $or: [{ name: searchRegex }, { slug: searchRegex }] });
    }

    if (paginatedDto.parentId) {
      and_clauses.push({
        parentId: { $eq: new Types.ObjectId(paginatedDto.parentId) },
      });
    } else {
      and_clauses.push({ parentId: { $eq: null } });
    }

    if (paginatedDto.status) {
      and_clauses.push({ status: paginatedDto.status });
    }

    if (paginatedDto.impact !== undefined) {
      and_clauses.push({ impact: paginatedDto.impact });
    }

    if (paginatedDto.required !== undefined) {
      and_clauses.push({ required: paginatedDto.required });
    }

    const sortField = paginatedDto.sortField || '_id';
    const sortOrder = paginatedDto.sortOrder === 'asc' ? 1 : -1;
    const conditions = { $and: and_clauses };

    const filterPipeline: PipelineStage[] = [
      { $match: conditions },
      { $skip: skip },
      { $limit: +limit },
      {
        $project: {
          name: 1,
          slug: 1,
          description: 1,
          parentId: 1,
          status: 1,
          impact: 1,
          required: 1,
          createdAt: 1,
        },
      },
      { $sort: { [sortField]: sortOrder } },
    ];

    const countPipeline: PipelineStage[] = [
      { $match: conditions },
      { $count: 'total' },
    ];

    const [countResult, aggregate] = await Promise.all([
      this.AccessModel.aggregate(countPipeline, { allowDiskUse: true })
        .exec()
        .catch((err) => {
          throw new InternalServerErrorException(err.message);
        }),
      this.AccessModel.aggregate(filterPipeline, { allowDiskUse: true })
        .exec()
        .catch((err) => {
          throw new InternalServerErrorException(err.message);
        }),
    ]);

    const totalDocs = countResult.length ? countResult[0].total : 0;
    const totalPages = Math.ceil(totalDocs / limit);
    const hasPrevPage = page !== 1;
    const hasNextPage = totalDocs - (skip + aggregate.length) > 0;

    return {
      meta: {
        totalDocs,
        skip,
        page,
        limit,
        totalPages,
        hasPrevPage,
        hasNextPage,
        prevPage: hasPrevPage ? page - 1 : null,
        nextPage: hasNextPage ? page + 1 : null,
      },
      docs: aggregate,
    };
  }

  async getAllCustom(): Promise<AccessDocument[]> {
    const aggregate = await this.AccessModel.aggregate([
      { $match: { $and: [{ isDeleted: false, status: 'Active' }] } },
      { $project: { isDeleted: 0, updatedAt: 0, createdAt: 0 } },
    ]);
    return aggregate ?? [];
  }
}
