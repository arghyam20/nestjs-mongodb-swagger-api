import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import mongoose, { HydratedDocument } from 'mongoose';
const roleGroup = ['admin', 'user'];

@Schema({ timestamps: true, versionKey: false })
export class Role {
  @Prop({ type: String, required: true })
  role: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    default: null,
    index: true,
  })
  tenantId: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true })
  roleDisplayName: string;

  @Prop({ type: String, default: 'admin', enum: roleGroup })
  roleGroup: string;

  @Prop({ type: String, default: '' })
  description: string;

  @Prop({
    type: [
      {
        access_name: { type: String },
        access_slug: { type: String },
        permission: {
          read: { type: Boolean, default: false },
          write: { type: Boolean, default: false },
          edit: { type: Boolean, default: false },
          delete: { type: Boolean, default: false },
        },
      },
      { _id: false },
    ],
    default: [],
  })
  permissions: any[];

  @Prop({ type: String, default: 'Active', enum: ['Active', 'Inactive'] })
  status: string;

  @Exclude()
  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;
}

export type RoleDocument = HydratedDocument<Role>;
export const RoleSchema = SchemaFactory.createForClass(Role);

// # Index Configurations
RoleSchema.index({ role: 1, isDeleted: 1 });
