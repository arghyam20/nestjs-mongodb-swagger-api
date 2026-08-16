import { SetMetadata } from '@nestjs/common';
import { PermissionAction } from '../enum/permission-action.enum';

export const PERMISSION_CHECK_KEY = 'permission_check';

export interface PermissionCheck {
  slug: string;
  action: PermissionAction;
}

export const Permission = (slug: string, action: PermissionAction) =>
  SetMetadata(PERMISSION_CHECK_KEY, { slug, action });
