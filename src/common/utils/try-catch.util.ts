import {
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

const logger = new Logger('TryCatch');

/**
 * Wraps an async function in a try-catch block.
 * Re-throws NestJS HttpExceptions as-is.
 * Wraps any other error in InternalServerErrorException.
 *
 * Usage in a service method:
 *   return tryCatch(() => this.repo.findOne(...), 'Failed to fetch item');
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorMessage?: string,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof HttpException) throw error;
    logger.error(errorMessage || 'Unexpected error', error?.stack || error);
    throw new InternalServerErrorException(errorMessage || 'An unexpected error occurred');
  }
}

/**
 * Method decorator for service classes.
 * Automatically wraps the decorated async method with try-catch.
 * Re-throws HttpExceptions, wraps everything else in InternalServerErrorException.
 *
 * Usage:
 *   @TryCatch('Failed to create user')
 *   async create(dto: CreateUserDto) { ... }
 */
export function TryCatch(errorMessage?: string): MethodDecorator {
  return (
    _target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
  ) => {
    const originalMethod = descriptor.value as (...args: any[]) => Promise<any>;

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        if (error instanceof HttpException) throw error;
        const msg = errorMessage || `Error in ${String(propertyKey)}`;
        logger.error(msg, error?.stack || error);
        throw new InternalServerErrorException(msg);
      }
    };

    return descriptor;
  };
}

/**
 * Wraps a promise and returns [data, error] tuple — never throws.
 * Useful when you want to handle both outcomes explicitly without try-catch blocks.
 *
 * Usage:
 *   const [user, err] = await safeAsync(this.usersService.findByEmail(email));
 *   if (err) throw new NotFoundException('User not found');
 */
export async function safeAsync<T>(
  promise: Promise<T>,
): Promise<[T, null] | [null, Error]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}
