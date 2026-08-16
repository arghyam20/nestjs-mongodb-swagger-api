import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import bcrypt, { compareSync, genSalt, genSaltSync, hashSync } from 'bcrypt';
import { Role } from 'src/modules/role/schemas/role.schema';

@Schema({ timestamps: true, versionKey: false })
export class User {
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
    default: [],
  })
  roles: Role[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    default: null,
    index: true,
  })
  tenantId: mongoose.Types.ObjectId;

  @Prop({ type: String, default: '', index: true })
  firstName: string;

  @Prop({ type: String, default: '', index: true })
  lastName: string;

  @Prop({ type: String, default: '', index: true })
  fullName: string;

  @Prop({ type: String, default: '' })
  countryCode: string;

  @Prop({ type: String, default: '', index: true })
  phone: string;

  @Prop({ type: String, default: '', index: true })
  email: string;

  @Prop({ type: String, default: '', index: true })
  userName: string;

  @Prop({ type: String, default: '' })
  password: string;

  @Prop({ type: String, default: '' })
  profileImage: string;

  @Prop({ type: String, default: '' })
  emailOtp: string;

  @Prop({ type: Date, default: null })
  otpExpireTime: Date;

  @Prop({ type: String, default: '' })
  bio: string;

  @Prop({
    type: String,
    default: 'Active',
    enum: ['Active', 'Inactive'],
    index: true,
  })
  status: string;

  @Prop({ default: false, type: Boolean })
  isAccountVerified: boolean;

  @Prop({ default: false, type: Boolean })
  isProfileCompleted: boolean;

  @Prop({ default: true, type: Boolean })
  isPushNotification: boolean;

  @Prop({ type: Boolean, default: false, index: true })
  isDeleted: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.validPassword = function (password: string) {
  return compareSync(password, this.password);
};

UserSchema.methods.generateHash = function (password: string) {
  return hashSync(password, genSaltSync(+(process.env.SALT_ROUND || 10)));
};

UserSchema.pre('save', async function (next: any) {
  const user = this as UserDocument;
  if (user.firstName || user.lastName || user.fullName) {
    if (user.fullName) {
      const nameParts = user.fullName.split(/\s+/);
      user.firstName =
        nameParts.slice(0, -1).join(' ').trim() || nameParts[0].trim();
      user.lastName =
        nameParts.length > 1 ? nameParts[nameParts.length - 1].trim() : '';
    } else {
      user.fullName =
        `${user.firstName?.trim() || ''} ${user.lastName?.trim() || ''}`.trim();
    }
  }

  if (!user.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  const hash = bcrypt.hashSync(user.password, salt);
  user.password = hash;
  next();
});

UserSchema.pre('findOneAndUpdate', async function (next: any) {
  const update = this.getUpdate() as Partial<UserDocument>;
  if (!update) return next();

  if (update.firstName || update.lastName || update.fullName) {
    if (update.fullName) {
      const nameParts = update.fullName.split(/\s+/);
      update.firstName =
        nameParts.slice(0, -1).join(' ').trim() || nameParts[0].trim();
      update.lastName =
        nameParts.length > 1 ? nameParts[nameParts.length - 1].trim() : '';
    } else {
      update.fullName =
        `${update.firstName?.trim() || ''} ${update.lastName?.trim() || ''}`.trim();
    }
  }

  // Hash password if modified
  if (update.password) {
    const salt = await genSalt(10);
    update.password = hashSync(update.password, salt);
  }

  this.setUpdate(update);
  next();
});

export type UserDocument = HydratedDocument<User> & {
  validPassword: (password: string) => boolean;
  generateHash: (password: string) => string;
};
