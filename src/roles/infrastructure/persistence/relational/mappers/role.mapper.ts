import { Role } from '../../../../domain/role';
import { RoleEntity } from '../entities/role.entity';

export class RoleMapper {
  static toDomain(raw: RoleEntity): Role {
    const role = new Role();
    role.id = raw.id;
    role.name = raw.name;
    return role;
  }

  static toPersistence(role: Role): RoleEntity {
    const entity = new RoleEntity();
    entity.id = role.id;
    if (role.name) entity.name = role.name;
    return entity;
  }
}
