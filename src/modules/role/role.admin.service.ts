import { Body, HttpStatus, Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { ApiResponse } from 'src/common/types/api-response.type';
import { RoleRepository } from './repositories/role.repository';
import {
  RoleListingDto,
  SaveRoleDto,
  StatusRoleDto,
  UpdateRoleDto,
} from './dto/role.dto';

@Injectable()
export class RoleAdminService {
  constructor(private roleRepository: RoleRepository) {}

  async getAll(@Body() body: RoleListingDto, user: any): Promise<ApiResponse> {
    let roles: object;

    const isSuperAdmin = user.roles.some((r: any) => r.role === 'super-admin');
    if (!isSuperAdmin && user.tenantId) {
      body.tenantId = user.tenantId.toString();
    }

    roles = await this.roleRepository.getAllPaginate(body);

    if (roles) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Roles fetched successfully.',
        data: roles,
      };
    } else {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Something went wrong.',
      };
    }
  }

  async save(body: SaveRoleDto, user: any): Promise<ApiResponse> {
    if (['super-admin', 'admin'].includes(body.role)) {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        message: `The ${body.role} role cannot be created or assigned.`,
      };
    }

    const existingRole = await this.roleRepository.getByField({
      role: body.role,
      tenantId: user.tenantId,
      isDeleted: false,
    });

    if (existingRole) {
      return {
        statusCode: HttpStatus.CONFLICT,
        message: 'This role already exists.',
      };
    }

    body.tenantId = user.tenantId;
    const saveRole = await this.roleRepository.save(body);
    if (saveRole && saveRole._id) {
      return {
        statusCode: HttpStatus.OK,
        message: 'role saved successfully.',
        data: saveRole,
      };
    } else {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Something went wrong.',
      };
    }
  }

  async get(id: string): Promise<ApiResponse> {
    if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid ID format.',
      };
    }

    const role = await this.roleRepository.getByField({
      _id: new mongoose.Types.ObjectId(id),
      role: { $nin: ['super-admin', 'admin'] },
      isDeleted: false,
    });

    if (!role) {
      return { statusCode: HttpStatus.NOT_FOUND, message: 'role not found.' };
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'role retrieved successfully.',
      data: role,
    };
  }

  async update(body: UpdateRoleDto): Promise<ApiResponse> {
    if (['super-admin', 'admin'].includes(body.role)) {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        message: `The ${body.role} role cannot be created or assigned.`,
      };
    }

    const roleToUpdate = await this.roleRepository.getByField({
      _id: new mongoose.Types.ObjectId(body.id),
      role: { $nin: ['super-admin', 'admin'] },
      isDeleted: false,
    });

    if (!roleToUpdate) {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'This role cannot be updated.',
      };
    }

    const existingRole = await this.roleRepository.getByField({
      role: body.role,
      tenantId: roleToUpdate?.tenantId,
      isDeleted: false,
      _id: { $ne: body.id },
    });

    if (existingRole) {
      return {
        statusCode: HttpStatus.CONFLICT,
        message: 'This role already exists.',
      };
    }

    const updatedValue = {
      role: body.role,
      roleGroup: body.roleGroup,
      roleDisplayName: body.roleDisplayName,
      permissions: body.permissions,
    };

    const updateRole = await this.roleRepository.updateById(
      updatedValue,
      body.id,
    );

    if (updateRole && updateRole._id) {
      return {
        statusCode: HttpStatus.OK,
        message: 'role updated successfully.',
        data: updateRole,
      };
    } else {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Something went wrong.',
      };
    }
  }

  async delete(id: string): Promise<ApiResponse> {
    if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid ID format.',
      };
    }

    const roleToDelete = await this.roleRepository.getByField({
      _id: new mongoose.Types.ObjectId(id),
      role: { $nin: ['super-admin', 'admin'] },
      isDeleted: false,
    });

    if (!roleToDelete) {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'This role cannot be deleted.',
      };
    }

    const deleteData = await this.roleRepository.updateById(
      { isDeleted: true },
      id,
    );

    if (deleteData) {
      return {
        statusCode: HttpStatus.OK,
        message: 'role deleted successfully.',
      };
    } else {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Something went wrong.',
      };
    }
  }

  async statusUpdate(body: StatusRoleDto): Promise<ApiResponse> {
    const updatedValue = {
      status: body.status,
    };

    const roleToUpdate = await this.roleRepository.getByField({
      _id: new mongoose.Types.ObjectId(body.id),
      role: { $nin: ['super-admin', 'admin'] },
      isDeleted: false,
    });

    if (!roleToUpdate) {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Status of this role cannot be updated.',
      };
    }

    const updateStatus = await this.roleRepository.updateById(
      updatedValue,
      body.id,
    );

    if (updateStatus && updateStatus._id) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Status updated successfully.',
        data: updateStatus,
      };
    } else {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Something went wrong.',
      };
    }
  }
}
