import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types, HydratedDocument } from 'mongoose';

export type AccessDocument = HydratedDocument<Access>;

@Schema({ timestamps: true, versionKey: false })
export class Access {
  @Prop({ type: String, default: '' })
  name: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Access', default: null })
  parentId: Types.ObjectId;

  @Prop({ type: String, default: '' })
  slug: string;

  @Prop({ type: String, default: '' })
  description: string;

  @Prop({ type: String, default: 'Active', enum: ['Active', 'Inactive'] })
  status: string;

  @Prop({ type: Boolean, default: false })
  impact: boolean;

  @Prop({ type: Boolean, default: false })
  required: boolean;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;
}

export const AccessSchema = SchemaFactory.createForClass(Access);

AccessSchema.index({ slug: 1, isDeleted: 1 });
