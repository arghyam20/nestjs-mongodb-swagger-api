import { SetMetadata } from '@nestjs/common';

export const ADMIN_GROUP_KEY = 'admin_group';
export const AdminGroup = () => SetMetadata(ADMIN_GROUP_KEY, true);
