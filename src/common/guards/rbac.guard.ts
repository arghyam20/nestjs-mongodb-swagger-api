import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ADMIN_GROUP_KEY } from '../decorator/admin-group.decorator';
import { USER_GROUP_KEY } from '../decorator/user-group.decorator';
import {
  PERMISSION_CHECK_KEY,
  PermissionCheck,
} from '../decorator/permissions.decorator';

@Injectable()
export class RBAcGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request?.user;

    if (!user?.roles || !Array.isArray(user.roles) || user.roles.length === 0)
      return false;

    const isAdminGroup = this.reflector.get<boolean>(
      ADMIN_GROUP_KEY,
      context.getHandler(),
    );
    const isUserGroup = this.reflector.get<boolean>(
      USER_GROUP_KEY,
      context.getHandler(),
    );
    const permissionCheck = this.reflector.get<PermissionCheck>(
      PERMISSION_CHECK_KEY,
      context.getHandler(),
    );

    // Must have at least one role in 'admin' roleGroup for admin routes
    if (isAdminGroup && !user.roles.some((r: any) => r.roleGroup === 'admin'))
      return false;

    // Must have at least one role in 'user' roleGroup for user routes
    if (isUserGroup && !user.roles.some((r: any) => r.roleGroup === 'user'))
      return false;

    // If any role is Super Admin ('super-admin') or Admin ('admin'), bypass permission checks
    if (user.roles.some((r: any) => ['super-admin', 'admin'].includes(r.role)))
      return true;

    // Dynamic permission check for non-super-admin roles
    if (permissionCheck) {
      // Check if ANY role has the required permission
      return user.roles.some((role: any) => {
        const userPermissions = role.permissions;
        if (!Array.isArray(userPermissions)) return false;

        const entry = userPermissions.find(
          (p) => p.access_slug === permissionCheck.slug,
        );
        if (!entry) return false;

        return !!entry.permission?.[permissionCheck.action];
      });
    }

    return true;
  }
}
