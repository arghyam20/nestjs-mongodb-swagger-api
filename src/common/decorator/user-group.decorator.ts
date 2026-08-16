import { SetMetadata } from '@nestjs/common';

export const USER_GROUP_KEY = 'user_group';
export const UserGroup = () => SetMetadata(USER_GROUP_KEY, true);
