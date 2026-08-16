import {
  BadRequestException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';

export class ApiValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      // transform: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        try {
          const firstError = validationErrors[0];
          let message = 'Validation failed';

          if (firstError.constraints) {
            message =
              firstError.constraints[Object.keys(firstError.constraints)[0]];
          } else if (firstError.children && firstError.children.length > 0) {
            // Handle nested validation errors
            const nestedError = firstError.children[0];
            if (nestedError.constraints) {
              message =
                nestedError.constraints[
                  Object.keys(nestedError.constraints)[0]
                ];
            } else if (
              nestedError.children &&
              nestedError.children.length > 0
            ) {
              // Handle double nested
              const doubleNested = nestedError.children[0];
              if (doubleNested.constraints) {
                message =
                  doubleNested.constraints[
                    Object.keys(doubleNested.constraints)[0]
                  ];
              }
            }
          }

          return new BadRequestException({
            message,
            statusCode: HttpStatus.BAD_REQUEST,
            error: 'Bad Request',
          });
        } catch (error) {
          return new BadRequestException({
            message: error.message,
            statusCode: HttpStatus.BAD_REQUEST, // Changed to 400 since it is a validation error
            error: 'Validation error',
          });
        }
      },
    });
  }
}
