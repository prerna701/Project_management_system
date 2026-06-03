export interface IPaginationOptions {
  page: number;
  limit: number;
}

export interface ISortOptions<T = string> {
  orderBy?: T;
  order?: 'ASC' | 'DESC';
}

export interface IBaseFilterOptions {
  search?: string;
  tags?: string[];
}

export type IFilterOptions<TExtension = Record<string, never>> =
  IBaseFilterOptions & TExtension;

export interface IQueryOptions<TEntity = any, TSortField = string> {
  paginationOptions: IPaginationOptions;
  sortOptions?: ISortOptions<TSortField>;
  filterOptions?: IFilterOptions<TEntity>;
  currentUserId?: string;
}
