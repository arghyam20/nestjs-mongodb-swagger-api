import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { NotificationType } from 'src/common/enum/notification-type.enum';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: true, versionKey: false })
export class Notification {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  })
  receiverUserId: Types.ObjectId;

  @Prop({ default: '' })
  title: string;

  @Prop({ default: '' })
  message: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DynamicForm',
    default: null,
    index: true,
  })
  workflowId: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MasterData',
    default: null,
    index: true,
  })
  formId: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
    index: true,
  })
  categoryId: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
    index: true,
    sparse: true,
  })
  subCategoryId: Types.ObjectId;

  @Prop({ type: Number, default: null })
  stepNo: number;

  @Prop({ type: String, default: null })
  stepId: string;

  @Prop({ type: Number, default: null })
  sectionNo: number;

  @Prop({ type: String, default: null })
  sectionId: string;

  @Prop({
    type: String,
    enum: NotificationType,
    default: NotificationType.SECTION_SUBMITTED,
  })
  type: NotificationType;

  @Prop({ type: mongoose.Schema.Types.Mixed, default: null })
  data: any;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: Date, default: null })
  readAt: Date;

  @Prop({ default: 'Active', enum: ['Active', 'Inactive'] })
  status: 'Active' | 'Inactive';

  @Prop({ default: false })
  isDeleted: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
