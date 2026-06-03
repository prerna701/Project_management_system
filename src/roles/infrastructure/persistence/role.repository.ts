import { Role } from '../../domain/role';

export abstract class RoleRepository {
  abstract findById(id: number): Promise<Role | null>;
  abstract findAll(): Promise<Role[]>;
  abstract create(role: Partial<Role>): Promise<Role>;
  abstract update(id: number, role: Partial<Role>): Promise<Role | null>;
  abstract remove(id: number): Promise<void>;
}
