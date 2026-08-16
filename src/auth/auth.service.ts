import {
  BadRequestException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { hash, genSalt } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UtilsHelper } from 'src/helpers/utils.helper';
import { ApiResponse } from 'src/common/types/api-response.type';
import { RoleRepository } from 'src/modules/role/repositories/role.repository';
import { UserRepository } from 'src/modules/user/repositories/user.repository';
import { Types } from 'mongoose';
import { MailerService } from 'src/helpers/mailer.helper';
import {
  ForgotPasswordDTO,
  RefreshJwtDto,
  ResetPasswordDTO,
  UserSignInDTO,
} from './dto/auth.dto';
import { RefreshTokenRepository } from 'src/modules/refresh-token/repository/refresh-token.repository';
import { UserDeviceRepository } from 'src/modules/user-devices/repository/user-device.repository';
import { WinstonLoggerService } from 'src/common/logger/winston.logger';
import { Messages } from 'src/common/constants/messages';
import { JwtPayloadType } from 'src/common/types/jwt.type';
import { Request } from 'express';
import { getClientIp } from 'request-ip';
import { lookup } from 'geoip-lite';
import { RefreshToken } from 'src/modules/refresh-token/schemas/refresh-token.schema';
import { UserDevice } from 'src/modules/user-devices/schemas/user-device.schema';

@Injectable()
export class AuthService {
  winston: WinstonLoggerService;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly configService: ConfigService,
    private readonly utilsHelper: UtilsHelper,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly userDeviceRepository: UserDeviceRepository,
  ) {
    this.winston = new WinstonLoggerService();
  }

  async generateRefreshToken(
    accessToken: string,
    user: string | Types.ObjectId,
  ): Promise<string> {
    const salt = await genSalt(10);

    const refreshToken = new RefreshToken();
    refreshToken.userId = user;
    refreshToken.hash = await hash(accessToken.split('.')[2] + salt, salt);
    await this.refreshTokenRepository.save(refreshToken);
    return salt;
  }

  async invalidAccessToken(user: Types.ObjectId): Promise<boolean> {
    const tokenDatas = await this.userDeviceRepository.getAllByField({
      user_id: user,
      expired: false,
      isDeleted: false,
    });

    tokenDatas.filter(async (tokenDoc) => {
      try {
        this.jwtService.verify(tokenDoc.accessToken, {
          secret: this.configService.getOrThrow('JWT_SECRET'),
        });
      } catch (err) {
        await this.userDeviceRepository.updateById(
          {
            expired: true,
          },
          tokenDoc?._id,
        );
        // return false; // expired or tampered
      }
    });

    return true;
  }

  async refreshToken(body: RefreshJwtDto): Promise<ApiResponse> {
    const authToken = body.accessToken;

    const tokenData = await this.userDeviceRepository.getByField({
      accessToken: authToken,
      isLoggedOut: false,
      // "expired": true,
      isDeleted: false,
    });

    if (tokenData?._id) {
      const refreshTokenHash = await hash(
        body.accessToken.split('.')[2] + body.refreshToken,
        body.refreshToken,
      );

      const refreshTokenData = await this.refreshTokenRepository.getByField({
        hash: refreshTokenHash,
      });
      if (!refreshTokenData)
        throw new BadRequestException(Messages.INVALID_TOKEN_ERROR);

      const user = await this.userRepository.getByField({
        _id: new Types.ObjectId(refreshTokenData.userId),
        isDeleted: false,
        status: 'Active',
      });
      if (!user?._id)
        throw new BadRequestException(Messages.USER_MISSING_ERROR);

      const expiresDate = new Date(refreshTokenData.createdAt);
      expiresDate.setSeconds(
        expiresDate.getSeconds() +
          this.configService.getOrThrow<number>('JWT_REFRESH_EXPIRES_IN'),
      );
      if (refreshTokenData.createdAt > expiresDate) {
        await this.refreshTokenRepository.delete(refreshTokenData._id);
        throw new UnauthorizedException(Messages.REFRESH_TOKEN_EXPIRED_ERROR);
      }

      const payload: JwtPayloadType = {
        id: refreshTokenData.userId.toString(),
      };
      const token = this.jwtService.sign(payload, {
        secret: this.configService.getOrThrow('JWT_SECRET'),
        expiresIn: this.configService.getOrThrow('JWT_ACCESS_EXPIRES_IN'),
      });

      const salt = await genSalt(10);
      refreshTokenData.hash = await hash(token.split('.')[2] + salt, salt);

      if (refreshTokenData) {
        await this.refreshTokenRepository.save(refreshTokenData);
      }

      const existingDeviceData = await this.userDeviceRepository.getByField({
        accessToken: body.accessToken,
      });

      if (existingDeviceData?._id) {
        await this.userDeviceRepository.updateById(
          {
            accessToken: token,
          },
          existingDeviceData?._id,
        );
      }

      return {
        statusCode: HttpStatus.OK,
        message: Messages.REFRESH_TOKEN_ISSUED_SUCCESS,
        data: { accessToken: token, refreshToken: salt },
      };
    } else {
      throw new UnauthorizedException(
        'Token has been invalidated. Please log in again.',
      );
    }
  }

  async userLogin(body: UserSignInDTO, req: Request): Promise<ApiResponse> {
    const checkIfExists = await this.userRepository.getByField({
      email: body.email,
      isDeleted: false,
    });

    if (!checkIfExists?._id)
      throw new BadRequestException(Messages.USER_MISSING_ERROR);

    if (!this.utilsHelper.validPassword(body.password, checkIfExists.password))
      throw new BadRequestException(Messages.INVALID_CREDENTIALS_ERROR);

    const userDetails = await this.userRepository.getUserDetails({
      _id: checkIfExists._id,
    });

    if (!userDetails)
      throw new BadRequestException(Messages.USER_MISSING_ERROR);

    if (userDetails.status === 'Inactive') {
      throw new BadRequestException(Messages.USER_INACTIVE_ERROR);
    }

    const payload = { id: checkIfExists._id };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('JWT_SECRET'),
      expiresIn: this.configService.getOrThrow('JWT_ACCESS_EXPIRES_IN'),
    });
    const refreshToken = await this.generateRefreshToken(
      token,
      checkIfExists._id,
    );

    try {
      const ip = getClientIp(req);
      const geoIpInfo = ip ? lookup(ip) : null;
      if (ip) {
        const existingDeviceData = await this.userDeviceRepository.getByField({
          accessToken: token,
        });
        const { ll, region, country, city, timezone } = geoIpInfo ?? {};
        const deviceInfo: Partial<UserDevice> = {
          ip,
          ip_lat: ll?.[0]?.toString() || '',
          ip_long: ll?.[1]?.toString() || '',
          last_active: Date.now(),
          state: region || '',
          country: country || '',
          city: city || '',
          timezone: timezone || '',
          user_id: userDetails._id,
          accessToken: token,
          deviceToken: body.deviceToken ?? '',
        };
        await this.userDeviceRepository.saveOrUpdate(
          deviceInfo,
          existingDeviceData?._id,
        );
      }
    } catch (err) {
      const stackTrace = (err as Error)?.stack
        ?.split('\n')
        ?.reverse()
        ?.slice(0, -2)
        ?.reverse()
        ?.join('\n');
      this.winston.error(stackTrace as string, 'userLoginService');
    }

    this.invalidAccessToken(userDetails._id);

    if (body.webPush) {
      await this.userDeviceRepository.savePushSubscription(token, body.webPush);
    }

    return {
      statusCode: HttpStatus.OK,
      message: Messages.USER_LOGIN_SUCCESS,
      data: {
        user: userDetails,
        accessToken: token,
        refreshToken: refreshToken,
      },
    };
  }

  async forgotPassword(body: ForgotPasswordDTO): Promise<ApiResponse> {
    const checkIfExists = await this.userRepository.getByField({
      email: body.email,
      isDeleted: false,
    });

    if (!checkIfExists?.id)
      throw new BadRequestException('No account found for this email address.');

    const userDetails = await this.userRepository.getUserDetails({
      _id: checkIfExists._id,
    });

    if (!userDetails)
      throw new BadRequestException(Messages.USER_MISSING_ERROR);

    const payload = { id: checkIfExists.id };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('JWT_SECRET'),
      expiresIn: '1d',
    });

    const projectName = process.env.PROJECT_NAME
      ? process.env.PROJECT_NAME
      : 'My Project';

    const locals = {
      site_logo_url: `${process.env.AWS_File_URL}images/logo.png`,
      name: checkIfExists.fullName,
      project_name: projectName,
      resetLink: `${body.baseUrl}/${token}`,
      current_year: new Date().getFullYear(),
    };

    await this.mailerService.sendMail(
      checkIfExists.email,
      'Password Reset Link',
      'user-forgot-password',
      locals,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Password reset link sent! Please check your email',
    };
  }

  async resetPassword(body: ResetPasswordDTO): Promise<ApiResponse> {
    const decoded = this.jwtService.verify(body.authToken, {
      secret: process.env.JWT_SECRET,
    });

    const checkIfExists = await this.userRepository.getByField({
      _id: decoded.id,
      isDeleted: false,
    });

    if (!checkIfExists?.id) throw new BadRequestException('User not found!');

    const roleDetails = await this.roleRepository.getAllByField({
      _id: { $in: checkIfExists.roles },
      isDeleted: false,
    });

    if (!roleDetails || roleDetails.length === 0)
      throw new BadRequestException('Invalid user roles');

    const hash = this.utilsHelper.generateHash(body.newPassword);

    const updatePassword = await this.userRepository.updateById(
      {
        password: hash,
      },
      checkIfExists._id,
    );

    if (updatePassword && updatePassword.id) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Password updated successfully.',
      };
    } else {
      throw new BadRequestException('Something went wrong!');
    }
  }

  async userLogout(req: Request): Promise<ApiResponse> {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      await this.userDeviceRepository.updateByField(
        {
          isLoggedOut: true,
        },
        {
          accessToken: token,
        },
      );

      return {
        statusCode: HttpStatus.OK,
        message: Messages.USER_LOGOUT_SUCCESS,
      };
    } catch (error) {
      throw new BadRequestException(Messages.SOMETHING_WENT_WRONG);
    }
  }
}
