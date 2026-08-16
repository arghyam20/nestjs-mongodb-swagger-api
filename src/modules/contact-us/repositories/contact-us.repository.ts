import { InjectModel } from '@nestjs/mongoose';
import { ContactUs, ContactUsDocument } from '../schemas/contact-us.schema';

import { PaginationResponse } from 'src/common/types/api-response.type';

import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { Model, PipelineStage } from 'mongoose';

import { BaseRepository } from 'src/common/bases/base.repository';
import { ContactUsListingDto } from '../dto/contact-us.dto';
import mongoose from 'mongoose';

@Injectable()
export class ContactUsRepository extends BaseRepository<ContactUsDocument> {
  constructor(
    @InjectModel(ContactUs.name)
    private ContactUsModel: Model<ContactUsDocument>,
  ) {
    super(ContactUsModel);
  }

  async getAllPaginate(
    paginatedDto: ContactUsListingDto,
  ): Promise<PaginationResponse<ContactUsDocument>> {
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
        $or: [{ fullName: searchRegex }, { email: searchRegex }],
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
          firstName: 1,
          lastName: 1,
          fullName: 1,
          email: 1,
          subject: 1,
          message: 1,
          isReplied: 1,
          createdAt: 1,
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
      this.ContactUsModel.aggregate(countPipeline, { allowDiskUse: true })
        .exec()
        .catch((error) => {
          throw new InternalServerErrorException(
            `Error during count aggregation: ${error.message}`,
          );
        }),
      this.ContactUsModel.aggregate(filterPipeline, { allowDiskUse: true })
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

  async getDetailsCustom(id: string): Promise<ContactUsDocument | null> {
    try {
      const conditions = {};
      const and_clauses: any[] = [];

      and_clauses.push({
        isDeleted: false,
        _id: new mongoose.Types.ObjectId(id),
      });
      conditions['$and'] = and_clauses;
      const aggregate = await this.ContactUsModel.aggregate(
        [
          { $match: conditions },
          {
            $lookup: {
              from: 'adminreplies',
              let: {
                contactId: '$_id',
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ['$contactId', '$$contactId'],
                        },
                        {
                          $eq: ['$isDeleted', false],
                        },
                      ],
                    },
                  },
                },
              ],
              as: 'adminReplies',
            },
          },
        ],
        { allowDiskUse: true },
      );
      if (!aggregate?.length) return null;
      return aggregate[0];
    } catch (err) {
      throw err;
    }
  }
}
