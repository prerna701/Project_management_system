import { PaginationMetaDto } from '../dto/pagination-response.dto';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMetaDto;
}

/**
 * Standard response wrapper — all endpoints return this shape.
 * { success, message, data, meta? }
 */
export const createResponse = <T>(
  message = 'Request successful',
  data: T,
  meta?: PaginationMetaDto,
): ApiResponse<T> => ({
  success: true,
  message,
  data,
  ...(meta ? { meta } : {}),
});

/**
 * Paginated response — same shape as createResponse but meta is always present.
 * data is the array of items (unified field, no "items" vs "data" split).
 */
export const createPaginatedResponse = <T>(
  message = 'Request successful',
  data: T[],
  meta: PaginationMetaDto,
): ApiResponse<T[]> => ({
  success: true,
  message,
  data,
  meta,
});
