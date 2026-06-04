import { Role } from '../../../../domain/role';
import { RoleEntity } from '../entities/role.entity';

export class RoleMapper {
  static toDomain(raw: RoleEntity): Role {
    const role = new Role();
    role.id = raw.id;
    role.name = raw.name;
    role.slug = raw.slug;
    role.userCount = (raw as any).userCount ?? 0;
    role.permissionCount = (raw as any).permissionCount ?? 0;
    return role;
  }

  static toPersistence(role: Role): RoleEntity {
    const entity = new RoleEntity();
    if (role.id) entity.id = role.id;
    if (role.name) entity.name = role.name;
    if (role.slug !== undefined) entity.slug = role.slug;
    return entity;
  }
}
