import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import {
  ForgotPasswordDTO,
  RefreshJwtDto,
  ResetPasswordDTO,
  UserSignInDTO,
} from './dto/auth.dto';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @UseGuards(ThrottlerGuard)
  async login(@Body() dto: UserSignInDTO, @Req() req: Request) {
    return this.authService.userLogin(dto, req);
  }

  @Post('forgot-password')
  @HttpCode(200)
  @UseGuards(ThrottlerGuard)
  async forgotPassword(@Body() dto: ForgotPasswordDTO) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @HttpCode(200)
  @UseGuards(ThrottlerGuard)
  async resetPassword(@Body() dto: ResetPasswordDTO) {
    return this.authService.resetPassword(dto);
  }

  @Post('refresh-token')
  @HttpCode(200)
  @UseGuards(ThrottlerGuard)
  async refreshToken(@Body() dto: RefreshJwtDto) {
    return this.authService.refreshToken(dto);
  }

  @Get('logout')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async logout(@Req() req: Request) {
    return this.authService.userLogout(req);
  }
}
