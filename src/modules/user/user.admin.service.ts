import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { ApiResponse } from 'src/common/types/api-response.type';
import { RoleRepository } from '../role/repositories/role.repository';
import {
  ListingFrontendUserDto,
  ListingUserDto,
  SaveFrontendUserDTO,
  StatusUserDto,
  UpdateFrontendUserDto,
} from './dto/user.dto';
import { UserRepository } from './repositories/user.repository';
import { UtilsHelper } from 'src/helpers/utils.helper';
import { MailerService } from 'src/helpers/mailer.helper';
import { deleteFileFromServer } from 'src/common/interceptors/files.interceptor';

@Injectable()
export class UserAdminService {
  constructor(
    private userRepository: UserRepository,
    private roleRepository: RoleRepository,
    private utilsHelper: UtilsHelper,
    private readonly mailerService: MailerService,
  ) {}

  async getAllFrontendUsers(
    body: ListingFrontendUserDto,
    user: any,
  ): Promise<ApiResponse> {
    if (
      !user.roles.some((r: any) => r.roleGroup === 'admin') &&
      user.tenantId
    ) {
      body.tenantId = user.tenantId.toString();
    }
    if (body.roleGroup) {
      const roles = await this.roleRepository.getAllByField({
        roleGroup: body.roleGroup,
        isDeleted: false,
      });
      const groupRoleIds = roles.map((r) => r._id.toString());

      if (body.roleIds && body.roleIds.length > 0) {
        body.roleIds = body.roleIds.filter((id) => groupRoleIds.includes(id));
      } else {
        body.roleIds = groupRoleIds;
      }
    }
    const getAllUsers = await this.userRepository.getAllPaginateFrontend(body);

    return {
      statusCode: HttpStatus.OK,
      message: 'User fetched successfully.',
      data: getAllUsers,
    };
  }

  async saveFrontendUser(
    body: SaveFrontendUserDTO,
    files: any,
    user: any,
  ): Promise<ApiResponse> {
    const userRolesList = await this.roleRepository.getAllByField({
      role: { $in: JSON.parse(body.roleTypes) },
      isDeleted: false,
    });

    if (userRolesList.length === 0)
      throw new BadRequestException('User roles not found!');

    // Only Super Admin (roleGroup: 'admin') can create users with 'admin' group roles
    const includesAdminGroup = userRolesList.some(
      (r) => r.roleGroup === 'admin',
    );
    if (
      includesAdminGroup &&
      !user.roles.some((r: any) => r.roleGroup === 'admin')
    ) {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Only Admin can create users with admin group roles.',
      };
    }

    const isEmailExists = await this.userRepository.getByField({
      email: { $regex: '^' + body.email + '$', $options: 'i' },
      isDeleted: false,
    });

    if (isEmailExists?._id)
      throw new BadRequestException('User with this email already exists!');

    if (files?.length) {
      body.profileImage = files[0].key;
    }

    body = this.utilsHelper.getNamesFromBody(body);

    body['tenantId'] = user.tenantId;

    const payload: Partial<any> = {
      ...body,
      roles: userRolesList.map((r) => r._id),
    };

    // Save new USER if the question doesn't exist
    const saveUser = await this.userRepository.save(payload);
    if (saveUser && saveUser._id) {
      const projectName = process.env.PROJECT_NAME
        ? process.env.PROJECT_NAME
        : 'My Project';

      const locals = {
        site_logo_url: `${process.env.BACKEND_URL}/images/logo.png`,
        name: saveUser.fullName,
        email: saveUser.email,
        password: body.password,
        project_name: projectName,
        current_year: new Date().getFullYear(),
      };

      await this.mailerService.sendMail(
        saveUser.email,
        `Welcome to ${projectName}`,
        'send-credentials-add-user',
        locals,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'User added successfully.',
        data: saveUser,
      };
    } else {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Something went wrong.',
      };
    }
  }

  async getFrontendUser(id: string): Promise<ApiResponse> {
    if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid ID format.',
      };
    }

    const userDetails = await this.userRepository.getUserDetails({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    });

    if (!userDetails) {
      return { statusCode: HttpStatus.NOT_FOUND, message: 'User not found.' };
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'User retrieved successfully.',
      data: userDetails as any,
    };
  }

  async updateFrontendUser(
    body: UpdateFrontendUserDto,
    files: any,
    user: any,
  ): Promise<ApiResponse> {
    const userDetails = await this.userRepository.getByField({
      _id: new mongoose.Types.ObjectId(body.id),
      isDeleted: false,
    });

    if (!userDetails?._id) {
      throw new BadRequestException('User not found!');
    }

    let roleTypeArr: string[] = [];

    try {
      roleTypeArr = body.roleTypes ? JSON.parse(body.roleTypes) : [];
    } catch (error) {
      throw new BadRequestException('Invalid roleTypes format!');
    }

    const currentRoles = await this.roleRepository.getAllByField({
      _id: { $in: userDetails.roles || [] },
      isDeleted: false,
    });

    const newRolesList =
      roleTypeArr.length > 0
        ? await this.roleRepository.getAllByField({
            role: { $in: roleTypeArr },
            isDeleted: false,
          })
        : [];

    const hasAdminGroupRole = currentRoles.some((r) => r.roleGroup === 'admin');

    const newHasAdminGroupRole = newRolesList.some(
      (r) => r.roleGroup === 'admin',
    );

    const loggedInUserIsAdmin = user.roles?.some(
      (r: any) => r.roleGroup === 'admin',
    );

    if ((hasAdminGroupRole || newHasAdminGroupRole) && !loggedInUserIsAdmin) {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Only Admin can update users with admin group roles.',
      };
    }

    const isEmailExists = await this.userRepository.getByField({
      email: {
        $regex: '^' + body.email + '$',
        $options: 'i',
      },
      isDeleted: false,
      _id: { $ne: body.id },
    });

    if (isEmailExists?._id) {
      throw new BadRequestException('User with this email already exists!');
    }

    if (body.isImageDeleted === 'true') {
      body.profileImage = '';

      if (userDetails.profileImage) {
        deleteFileFromServer(userDetails.profileImage);
      }
    }

    if (files?.length) {
      body.profileImage = files[0].key;

      if (userDetails.profileImage) {
        deleteFileFromServer(userDetails.profileImage);
      }
    }

    body = this.utilsHelper.getNamesFromBody(body);

    const payload: any = {
      ...body,
    };

    if (roleTypeArr.length > 0) {
      payload.roles = [...new Set(newRolesList.map((r) => r._id.toString()))];

      delete payload.roleTypes;
    }

    const updateUser = await this.userRepository.updateById(payload, body.id);
    if (updateUser && updateUser._id) {
      return {
        statusCode: HttpStatus.OK,
        message: 'User updated successfully.',
        data: updateUser,
      };
    } else {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Something went wrong.',
      };
    }
  }

  async deleteFrontendUser(id: string, user: any): Promise<ApiResponse> {
    if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid ID format.',
      };
    }

    const userDetails = await this.userRepository.fineOneWithRole({
      _id: new mongoose.Types.ObjectId(id),
      isDeleted: false,
    });

    if (!userDetails) {
      return { statusCode: HttpStatus.NOT_FOUND, message: 'User not found.' };
    }

    const hasAdminGroupRole = userDetails.roles.some(
      (r: any) => r.roleGroup === 'admin',
    );
    if (
      hasAdminGroupRole &&
      !user.roles.some((r: any) => r.roleGroup === 'admin')
    ) {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Only Admin can delete users with admin group roles.',
      };
    }

    const deleteData = await this.userRepository.updateById(
      { isDeleted: true },
      id,
    );
    if (deleteData) {
      if (deleteData.profileImage) {
        deleteFileFromServer(deleteData.profileImage);
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'User deleted successfully.',
      };
    } else {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Something went wrong.',
      };
    }
  }

  async statusUpdateFrontendUser(
    body: StatusUserDto,
    user: any,
  ): Promise<ApiResponse> {
    const updatedValue = {
      status: body.status,
    };

    const userDetails = await this.userRepository.fineOneWithRole({
      _id: new mongoose.Types.ObjectId(body.id),
      isDeleted: false,
    });

    if (!userDetails) {
      return { statusCode: HttpStatus.NOT_FOUND, message: 'User not found.' };
    }

    const hasAdminGroupRole = userDetails.roles.some(
      (r: any) => r.roleGroup === 'admin',
    );
    if (
      hasAdminGroupRole &&
      !user.roles.some((r: any) => r.roleGroup === 'admin')
    ) {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        message:
          'Only Admin can update status of users with admin group roles.',
      };
    }

    const updateStatus = await this.userRepository.updateById(
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

  async getListing(body: ListingUserDto, user: any): Promise<ApiResponse> {
    if (body.roleGroup) {
      const roles = await this.roleRepository.getAllByField({
        roleGroup: body.roleGroup,
        isDeleted: false,
      });
      const groupRoleIds = roles.map((r) => r._id.toString());

      if (body.roleIds && body.roleIds.length > 0) {
        body.roleIds = body.roleIds.filter((id) => groupRoleIds.includes(id));
      } else {
        body.roleIds = groupRoleIds;
      }
    }

    if (
      !user.roles.some((r: any) => r.roleGroup === 'admin') &&
      user.tenantId
    ) {
      body.tenantId = user.tenantId.toString();
    }

    const getAllUsers = await this.userRepository.getListing(body);

    if (getAllUsers) {
      return {
        statusCode: HttpStatus.OK,
        message: 'User data fetched successfully.',
        data: getAllUsers,
      };
    } else {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Something went wrong.',
      };
    }
  }
}
