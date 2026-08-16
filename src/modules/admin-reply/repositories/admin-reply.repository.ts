import { AdminReply, AdminReplyDocument } from '../schemas/admin-reply.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

import { BaseRepository } from 'src/common/bases/base.repository';

@Injectable()
export class AdminReplyRepository extends BaseRepository<AdminReplyDocument> {
  constructor(
    @InjectModel(AdminReply.name) AdminReplyModel: Model<AdminReplyDocument>,
  ) {
    super(AdminReplyModel);
  }
}
