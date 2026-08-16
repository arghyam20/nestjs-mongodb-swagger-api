import { InjectModel } from '@nestjs/mongoose';
import { Setting, SettingDocument } from '../schemas/setting.schema';

import { Injectable } from '@nestjs/common';

import { Model } from 'mongoose';

import { BaseRepository } from 'src/common/bases/base.repository';

@Injectable()
export class SettingRepository extends BaseRepository<SettingDocument> {
  constructor(
    @InjectModel(Setting.name) private SettingModel: Model<SettingDocument>,
  ) {
    super(SettingModel);
  }

  async findSettingCms(): Promise<SettingDocument | null> {
    try {
      const aggregate = await this.SettingModel.aggregate([{ $limit: 1 }]);
      if (!aggregate?.length) return null;
      return aggregate[0];
    } catch (err) {
      throw err;
    }
  }
}
