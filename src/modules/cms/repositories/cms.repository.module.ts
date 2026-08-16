import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Cms, CmsSchema } from '../schemas/cms.schema';
import { CmsRepository } from './cms.repository';

@Global()
@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Cms.name,
        useFactory: () => {
          const schema = CmsSchema;
          return schema;
        },
      },
    ]),
  ],
  controllers: [],
  providers: [CmsRepository],
  exports: [CmsRepository],
})
export class CmsRepositoryModule {}
