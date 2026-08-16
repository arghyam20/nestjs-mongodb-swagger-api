import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Access, AccessSchema } from '../schemas/access.schema';
import { AccessRepository } from './access.repository';

@Global()
@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Access.name,
        useFactory: () => {
          const schema = AccessSchema;
          return schema;
        },
      },
    ]),
  ],
  controllers: [],
  providers: [AccessRepository],
  exports: [AccessRepository],
})
export class AccessRepositoryModule {}
