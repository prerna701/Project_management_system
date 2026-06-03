import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionEntity } from '../../../../permissions/infrastructure/persistence/relational/entities/permission.entity';

@Injectable()
export class PermissionSeedService {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly permissionRepo: Repository<PermissionEntity>,
  ) {}

  async run(): Promise<void> {
    const permissions = [
      { name: 'users.browse', label: 'Browse Users', module: 'users' },
      { name: 'users.read', label: 'Read Users', module: 'users' },
      { name: 'users.add', label: 'Add Users', module: 'users' },
      { name: 'users.edit', label: 'Edit Users', module: 'users' },
      { name: 'users.delete', label: 'Delete Users', module: 'users' },
      { name: 'roles.browse', label: 'Browse Roles', module: 'roles' },
      { name: 'roles.read', label: 'Read Roles', module: 'roles' },
      { name: 'roles.add', label: 'Add Roles', module: 'roles' },
      { name: 'roles.edit', label: 'Edit Roles', module: 'roles' },
      { name: 'roles.delete', label: 'Delete Roles', module: 'roles' },
      { name: 'permissions.browse', label: 'Browse Permissions', module: 'permissions' },
      { name: 'permissions.read', label: 'Read Permissions', module: 'permissions' },
      { name: 'permissions.add', label: 'Add Permissions', module: 'permissions' },
      { name: 'permissions.edit', label: 'Edit Permissions', module: 'permissions' },
      { name: 'permissions.delete', label: 'Delete Permissions', module: 'permissions' },
    ];

    for (const perm of permissions) {
      const existing = await this.permissionRepo.findOne({ where: { name: perm.name } });
      if (!existing) {
        await this.permissionRepo.save(this.permissionRepo.create(perm));
        console.log(`✅ Seeded permission: ${perm.name}`);
      } else {
        console.log(`⚪ Permission already exists: ${perm.name}`);
      }
    }
  }
}
