import { Module } from '@nestjs/common';
import { JwtStrategy } from './strategy/auth.strategy';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtService],
  exports: [JwtStrategy],
})
export class AuthModule {}
