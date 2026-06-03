import { BaseQueryDto } from '../dto/base-query.dto';
import {
  IFilterOptions,
  IPaginationOptions,
  IQueryOptions,
  ISortOptions,
} from '../types/pagination-options';

export const API_PAGE_LIMIT = 100;

export function extractPaginationOptions(
  queryDto: Pick<BaseQueryDto, 'page' | 'limit'>,
  maxLimit: number = API_PAGE_LIMIT,
): IPaginationOptions {
  const safePage = queryDto.page ?? 1;
  const safeLimit = Math.min(queryDto.limit ?? 10, maxLimit);

  return {
    page: Math.abs(safePage),
    limit: Math.abs(safeLimit),
  };
}

export function extractSortOptions<TSortField = string>(
  queryDto: Pick<BaseQueryDto, 'orderBy' | 'order'>,
): ISortOptions<TSortField> | undefined {
  if (!queryDto.orderBy && !queryDto.order) return undefined;

  return {
    orderBy: queryDto.orderBy as TSortField,
    order: queryDto.order ?? 'DESC',
  };
}

export function extractFilterOptions<T = any>(
  queryDto: BaseQueryDto,
): IFilterOptions<T> | undefined {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { page, limit, orderBy, order, search, tags, ...rest } = queryDto;

  const hasFilters =
    search !== undefined ||
    (tags && tags.length > 0) ||
    Object.keys(rest).length > 0;

  if (!hasFilters) return undefined;

  return { search, tags, ...rest } as IFilterOptions<T>;
}

export function extractQueryOptions<TSortField = string, TEntity = any>(
  queryDto: BaseQueryDto,
  maxLimit: number = API_PAGE_LIMIT,
): IQueryOptions<TEntity, TSortField> {
  return {
    paginationOptions: extractPaginationOptions(queryDto, maxLimit),
    sortOptions: extractSortOptions<TSortField>(queryDto),
    filterOptions: extractFilterOptions<TEntity>(queryDto),
  };
}
