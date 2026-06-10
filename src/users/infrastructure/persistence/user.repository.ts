import { User } from '../../domain/user';
import { IPaginationOptions } from '../../../common/types/pagination-options';
import { NullableType } from '../../../common/types/nullable.type';
import { PaginationMetaDto } from '../../../common/dto/pagination-response.dto';

export abstract class UserRepository {
  abstract create(user: Partial<User>): Promise<User>;
  abstract findById(id: string, withRelations?: boolean): Promise<NullableType<User>>;
  abstract findByEmail(email: string): Promise<NullableType<User>>;
  abstract findAll(): Promise<User[]>;
  abstract findManyWithPagination(options: {
    paginationOptions: IPaginationOptions;
    search?: string;
  }): Promise<{ items: User[]; meta: PaginationMetaDto }>;
  abstract update(id: string, payload: Partial<User>): Promise<NullableType<User>>;
  abstract remove(id: string): Promise<void>;
  abstract getUserRoles(userId: string): Promise<any[]>;
  abstract getUserDirectPermissions(userId: string): Promise<any[]>;
  abstract getUserPermissions(userId: string, roleIds?: number[]): Promise<any[]>;
  abstract setPermissions(userId: string, permissionIds: number[]): Promise<void>;
  abstract assignRole(userId: string, roleId: number): Promise<void>;
  abstract removeRole(userId: string, roleId: number): Promise<void>;
  abstract assignPermission(userId: string, permissionId: number, resourceId?: string, resourceType?: string): Promise<void>;
  abstract removePermission(userId: string, permissionId: number): Promise<void>;
}
