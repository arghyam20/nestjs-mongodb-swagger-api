import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactUs, ContactUsSchema } from '../schemas/contact-us.schema';
import { ContactUsRepository } from './contact-us.repository';

@Global()
@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: ContactUs.name,
        useFactory: () => {
          const schema = ContactUsSchema;
          return schema;
        },
      },
    ]),
  ],
  controllers: [],
  providers: [ContactUsRepository],
  exports: [ContactUsRepository],
})
export class ContactUsRepositoryModule {}
