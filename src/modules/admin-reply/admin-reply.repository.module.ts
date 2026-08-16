import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminReply, AdminReplySchema } from './schemas/admin-reply.schema';
import { AdminReplyRepository } from './repositories/admin-reply.repository';

@Global()
@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: AdminReply.name,
        useFactory: () => {
          const schema = AdminReplySchema;
          return schema;
        },
      },
    ]),
  ],
  controllers: [],
  providers: [AdminReplyRepository],
  exports: [AdminReplyRepository],
})
export class AdminReplyRepositoryModule {}
