import { InjectModel } from '@nestjs/mongoose';
import {
  Notification,
  NotificationDocument,
} from '../schemas/notification.schema';
import { PaginationResponse } from 'src/common/types/api-response.type';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Model, PipelineStage, Types } from 'mongoose';
import { BaseRepository } from 'src/common/bases/base.repository';
import { NotificationListingDto } from '../dto/notification.dto';

@Injectable()
export class NotificationRepository extends BaseRepository<NotificationDocument> {
  constructor(
    @InjectModel(Notification.name)
    private NotificationModel: Model<NotificationDocument>,
  ) {
    super(NotificationModel);
  }

  async getAllPaginate(
    paginatedDto: NotificationListingDto,
  ): Promise<PaginationResponse<NotificationDocument>> {
    const conditions = {};
    const and_clauses: any[] = [];

    const page = paginatedDto.page || 1;
    const limit = paginatedDto.limit || 10;
    const skip = (page - 1) * limit;

    and_clauses.push({ isDeleted: false, status: 'Active' });

    // Optional search condition
    if (paginatedDto.search) {
      const searchRegex = new RegExp(paginatedDto.search, 'i'); // Case-insensitive search
      and_clauses.push({
        $or: [{ title: searchRegex }, { message: searchRegex }],
      });
    }

    // Optional receiverUserId filter
    if (paginatedDto.userId) {
      and_clauses.push({
        receiverUserId: new Types.ObjectId(paginatedDto.userId),
      });
    }

    // Optional sorting
    const sortField = paginatedDto.sortField || 'createdAt'; // Default to sorting by _id if no field is provided
    const sortOrder = paginatedDto.sortOrder === 'asc' ? 1 : -1; // Default to descending order if not provided

    conditions['$and'] = and_clauses;

    const filterPipeline: PipelineStage[] = [
      { $match: conditions },
      {
        $lookup: {
          from: 'users',
          let: { userId: '$userId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', '$$userId'] },
                    { $eq: ['$isDeleted', false] },
                  ],
                },
              },
            },
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
      {
        $unwind: {
          path: '$userData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          title: 1,
          message: 1,
          type: 1,
          workflowId: 1,
          formId: 1,
          categoryId: 1,
          subCategoryId: 1,
          stepNo: 1,
          stepId: 1,
          sectionNo: 1,
          sectionId: 1,
          isRead: 1,
          readAt: 1,
          userData: 1,
          data: 1,
          createdAt: 1,
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
      this.NotificationModel.aggregate(countPipeline, { allowDiskUse: true })
        .exec()
        .catch((error) => {
          throw new InternalServerErrorException(
            `Error during count aggregation: ${error.message}`,
          );
        }),
      this.NotificationModel.aggregate(filterPipeline, {
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
}
