import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type ContactUsDocument = mongoose.HydratedDocument<ContactUs>;

@Schema({ timestamps: true, versionKey: false })
export class ContactUs {
  @Prop({ type: String, default: '', index: true })
  firstName: string;

  @Prop({ type: String, default: '', index: true })
  lastName: string;

  @Prop({ type: String, default: '', index: true })
  fullName: string;

  @Prop({ type: String, default: '', index: true })
  email: string;

  @Prop({ type: String, default: '' })
  subject: string;

  @Prop({ type: String, default: '' })
  message: string;

  @Prop({ type: Boolean, default: false })
  isReplied: boolean;

  @Prop({ type: String, default: 'Active', enum: ['Active', 'Inactive'] })
  status: string;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;
}

export const ContactUsSchema = SchemaFactory.createForClass(ContactUs);
