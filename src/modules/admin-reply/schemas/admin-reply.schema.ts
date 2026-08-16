import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

export type AdminReplyDocument = mongoose.HydratedDocument<AdminReply>;

@Schema({ timestamps: true, versionKey: false })
export class AdminReply {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'ContactUs', index: true })
  contactId: Types.ObjectId;

  @Prop({ type: String, default: '' })
  message: string;

  @Prop({ type: String, default: 'Active', enum: ['Active', 'Inactive'] })
  status: string;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;
}

export const AdminReplySchema = SchemaFactory.createForClass(AdminReply);
