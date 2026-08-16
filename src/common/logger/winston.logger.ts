import { Injectable } from '@nestjs/common';
import winston from 'winston';
import path from 'path';

@Injectable()
export class WinstonLoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    const defaultFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    );

    /* for handling all error and debug related logs */
    this.logger = winston.createLogger({
      level: 'error',
      format: defaultFormat,
      transports: [
        new winston.transports.File({
          filename: path.join('./logs/error.log'),
          handleExceptions: true,
        }),
      ],
    });
  }

  error(message: string, trace: string) {
    this.logger.error(message, { trace });
  }

  debug(message: string, trace: string) {
    this.logger.debug(message, { trace });
  }
}
