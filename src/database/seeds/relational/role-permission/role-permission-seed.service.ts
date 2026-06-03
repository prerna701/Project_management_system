import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolePermissionEntity } from '../../../../users/infrastructure/persistence/relational/entities/role-permission.entity';
import { PermissionEntity } from '../../../../permissions/infrastructure/persistence/relational/entities/permission.entity';

@Injectable()
export class RolePermissionSeedService {
  constructor(
    @InjectRepository(RolePermissionEntity)
    private readonly rolePermRepo: Repository<RolePermissionEntity>,
    @InjectRepository(PermissionEntity)
    private readonly permRepo: Repository<PermissionEntity>,
  ) {}

  async run(): Promise<void> {
    // Admin (id=1) → all permissions (seeded by permission seed)
    // Manager (id=3) → browse + read only on users
    // User (id=2) → no role-level permissions (gets direct user-level ones if needed)

    const allPerms = await this.permRepo.find();

    const permByName = (name: string) => allPerms.find((p) => p.name === name);

    const assignments: { roleId: number; permissionName: string }[] = [
      // Admin gets everything
      ...allPerms.map((p) => ({ roleId: 1, permissionName: p.name })),

      // Manager gets browse/read on users
      { roleId: 3, permissionName: 'users.browse' },
      { roleId: 3, permissionName: 'users.read' },

      // User gets nothing at role level (assign per-user as needed)
    ];

    for (const { roleId, permissionName } of assignments) {
      const perm = permByName(permissionName);
      if (!perm) continue;

      const existing = await this.rolePermRepo.findOne({
        where: { roleId, permissionId: perm.id },
      });

      if (!existing) {
        await this.rolePermRepo.save(
          this.rolePermRepo.create({ roleId, permissionId: perm.id }),
        );
        console.log(`✅ Role ${roleId} → ${permissionName}`);
      } else {
        console.log(`⚪ Already assigned: Role ${roleId} → ${permissionName}`);
      }
    }
  }
}
