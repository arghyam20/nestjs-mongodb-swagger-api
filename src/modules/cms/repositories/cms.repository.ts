import { InjectModel } from '@nestjs/mongoose';
import { Cms, CmsDocument } from '../schemas/cms.schema';
import { PaginationResponse } from 'src/common/types/api-response.type';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Model, PipelineStage } from 'mongoose';
import { BaseRepository } from 'src/common/bases/base.repository';
import { CmsListingDto } from '../dto/cms.dto';

@Injectable()
export class CmsRepository extends BaseRepository<CmsDocument> {
  constructor(@InjectModel(Cms.name) private CmsModel: Model<CmsDocument>) {
    super(CmsModel);
  }

  async getAllPaginate(
    paginatedDto: CmsListingDto,
  ): Promise<PaginationResponse<CmsDocument>> {
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
        $or: [{ title: searchRegex }],
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
        $project: {
          title: 1,
          content: 1,
          slug: 1,
          createdAt: 1,
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
      this.CmsModel.aggregate(countPipeline, { allowDiskUse: true })
        .exec()
        .catch((error) => {
          throw new InternalServerErrorException(
            `Error during count aggregation: ${error.message}`,
          );
        }),
      this.CmsModel.aggregate(filterPipeline, { allowDiskUse: true })
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

  async getByFieldWithProjection(params: any, projection: any): Promise<any> {
    try {
      return await this.CmsModel.findOne(params, projection).exec();
    } catch (error) {
      return error;
    }
  }
}
