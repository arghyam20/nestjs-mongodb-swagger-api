import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserDevice, UserDeviceDocument } from '../schemas/user-device.schema';
import { Model, PipelineStage, Types } from 'mongoose';
import { UserDeviceListingDto } from '../dto/user-devices.dto';
import { BaseRepository } from 'src/common/bases/base.repository';
import { PaginationResponse } from 'src/common/types/api-response.type';

@Injectable()
export class UserDeviceRepository extends BaseRepository<UserDeviceDocument> {
  constructor(
    @InjectModel(UserDevice.name)
    private readonly userDeviceModel: Model<UserDeviceDocument>,
  ) {
    super(userDeviceModel);
  }

  async getSubscriptionsByUserId(
    userId: Types.ObjectId,
  ): Promise<{ endpoint: string; keys: { p256dh: string; auth: string } }[]> {
    type WebPush = {
      endpoint?: string;
      keys?: { p256dh?: string; auth?: string };
    };

    const devices = await this.userDeviceModel.find(
      {
        user_id: userId,
        'webPush.endpoint': { $exists: true, $ne: '' },
        isDeleted: false,
        isLoggedOut: false,
        expired: false,
      },
      { webPush: 1 },
    );

    return devices
      .map((d) => d.webPush as WebPush)
      .filter(
        (
          wp,
        ): wp is { endpoint: string; keys: { p256dh: string; auth: string } } =>
          !!wp?.endpoint && !!wp?.keys?.p256dh && !!wp?.keys?.auth,
      )
      .map((wp) => ({
        endpoint: wp.endpoint,
        keys: { p256dh: wp.keys.p256dh, auth: wp.keys.auth },
      }));
  }

  async savePushSubscription(
    accessToken: string,
    subscription: Record<string, any>,
  ): Promise<void> {
    await this.userDeviceModel.updateOne(
      { accessToken },
      { $set: { webPush: subscription } },
    );
  }

  async getAllDevicesPaginated(
    paginatedDto: UserDeviceListingDto,
    token?: string,
  ): Promise<PaginationResponse<UserDeviceDocument>> {
    try {
      type MongoQuery = {
        [key: string]: any;
      };
      const conditions: MongoQuery = {};
      const and_clauses: Partial<UserDevice>[] = [];

      const page = paginatedDto.page || 1;
      const limit = paginatedDto.limit || 10;
      const skip = (page - 1) * limit;

      and_clauses.push({
        isDeleted: false,
        expired: false,
        user_id: new Types.ObjectId(paginatedDto.user_id),
      });

      conditions['$and'] = and_clauses;

      const filterPipeline: PipelineStage[] = [
        { $match: conditions },
        { $skip: skip },
        { $limit: +limit },
        {
          $project: {
            user_id: '$user_id',
            deviceToken: '$deviceToken',
            deviceType: '$deviceType',
            ip: '$ip',
            ip_lat: '$ip_lat',
            ip_long: '$ip_long',
            browserInfo: '$browserInfo',
            deviceInfo: '$deviceInfo',
            operatingSystem: '$operatingSystem',
            last_active: '$last_active',
            state: '$state',
            country: '$country',
            city: '$city',
            timezone: '$timezone',
            accessToken: '$accessToken',
            expired: '$expired',
            role: '$role',
            isDeleted: '$isDeleted',
            isCurrent: { $eq: ['$accessToken', token] },
          },
        },
        { $sort: { _id: -1 } },
      ];

      const countPipeline: PipelineStage[] = [
        { $match: conditions },
        { $count: 'total' },
      ];

      const [countResult, aggregate] = await Promise.all([
        this.userDeviceModel
          .aggregate(countPipeline, { allowDiskUse: true })
          .exec(),
        this.userDeviceModel
          .aggregate(filterPipeline, { allowDiskUse: true })
          .exec(),
      ]);

      const totalDocs = countResult.length ? countResult[0].total : 0;
      const hasNextPage =
        totalDocs > 0 && totalDocs - (skip + aggregate.length) > 0;
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
    } catch (error) {
      throw new InternalServerErrorException((error as Error).message);
    }
  }
}
