import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  UnauthorizedException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { WinstonLoggerService } from '../logger/winston.logger';
import { ConfigService } from '@nestjs/config';
import { ThrottlerException } from '@nestjs/throttler';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  winston: WinstonLoggerService;
  configService: ConfigService;

  constructor() {
    this.winston = new WinstonLoggerService();
    this.configService = new ConfigService();
  }

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof ThrottlerException) {
      return response.status(exception.getStatus()).send({
        message: 'Too Many Requests',
        statusCode: exception.getStatus(),
      });
    } else if (exception instanceof UnauthorizedException) {
      return response.status(exception.getStatus()).send({
        message: 'Unauthorized',
        statusCode: exception.getStatus(),
        auth: false,
      });
    } else if (exception instanceof HttpException) {
      return response
        .status(exception.getStatus())
        .send(exception.getResponse());
    } else {
      const stackTrace = exception?.stack
        ?.split('\n')
        ?.reverse()
        ?.slice(0, -2)
        ?.reverse()
        ?.join('\n');
      this.winston.error(stackTrace as string, CustomExceptionFilter.name);

      return response.status(500).send({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception?.message || exception,
        stack:
          this.configService.get('APP_ENV') == 'development'
            ? stackTrace
            : null,
      });
    }
  }
}
