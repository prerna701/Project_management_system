import { Permission } from '../../../../domain/permission';
import { PermissionEntity } from '../entities/permission.entity';

export class PermissionMapper {
  static toDomain(raw: PermissionEntity): Permission {
    const perm = new Permission();
    perm.id = raw.id;
    perm.name = raw.name;
    perm.label = raw.label;
    perm.module = raw.module;
    return perm;
  }

  static toPersistence(perm: Permission): PermissionEntity {
    const entity = new PermissionEntity();
    entity.id = perm.id;
    entity.name = perm.name;
    if (perm.label) entity.label = perm.label;
    if (perm.module) entity.module = perm.module;
    return entity;
  }
}
