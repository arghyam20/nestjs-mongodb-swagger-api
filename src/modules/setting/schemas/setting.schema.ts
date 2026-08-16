import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type SettingDocument = mongoose.HydratedDocument<Setting>;

@Schema({ timestamps: true, versionKey: false })
export class Setting {
  @Prop({ type: String, default: '' })
  email: string;

  @Prop({ type: String, default: '', index: true })
  phone: string;

  @Prop({ type: String, default: '' })
  address: string;

  @Prop({ type: String, default: 'Active', enum: ['Active', 'Inactive'] })
  status: string;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
