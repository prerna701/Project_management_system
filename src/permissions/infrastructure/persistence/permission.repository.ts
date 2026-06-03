import { Permission } from '../../domain/permission';

export abstract class PermissionRepository {
  abstract findById(id: number): Promise<Permission | null>;
  abstract findByName(name: string): Promise<Permission | null>;
  abstract findAll(): Promise<Permission[]>;
  abstract findByModule(module: string): Promise<Permission[]>;
  abstract create(permission: Partial<Permission>): Promise<Permission>;
  abstract update(id: number, permission: Partial<Permission>): Promise<Permission | null>;
  abstract remove(id: number): Promise<void>;
}
