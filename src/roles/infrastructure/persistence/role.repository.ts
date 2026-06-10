import { Role } from '../../domain/role';

export abstract class RoleRepository {
  abstract findById(id: number): Promise<Role | null>;
  abstract findAll(): Promise<Role[]>;
  abstract create(role: Partial<Role>): Promise<Role>;
  abstract update(id: number, role: Partial<Role>): Promise<Role | null>;
  abstract remove(id: number): Promise<void>;
  abstract getPermissions(roleId: number): Promise<any[]>;
  abstract getPermissionMatrix(roleId: number): Promise<any[]>;
  abstract setPermissions(roleId: number, permissionIds: number[]): Promise<void>;
  abstract assignPermission(roleId: number, permissionId: number): Promise<void>;
  abstract removePermission(roleId: number, permissionId: number): Promise<void>;
}
