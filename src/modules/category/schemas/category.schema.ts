import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types, HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true, versionKey: false })
export class Category {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
    sparse: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Tenant',
    default: null,
    index: true,
    sparse: true,
  })
  tenantId: Types.ObjectId;

  @Prop({ default: '' })
  name: string;

  @Prop({ default: '' })
  slug: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '' })
  icon: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Category',
    default: null,
    index: true,
    sparse: true,
  })
  parentId: Types.ObjectId;

  @Prop({ default: 'Active', enum: ['Active', 'Inactive'] })
  status: 'Active' | 'Inactive';

  @Prop({ default: false })
  isDeleted: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
