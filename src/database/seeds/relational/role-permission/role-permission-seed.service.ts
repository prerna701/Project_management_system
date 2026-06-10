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

      // Manager: user lookup plus full project/team/task workflow.
      { roleId: 3, permissionName: 'users.browse' },
      { roleId: 3, permissionName: 'users.read' },
      ...[
        'projects.browse',
        'projects.read',
        'projects.add',
        'projects.edit',
        'projects.delete',
        'projects.assign_team',
        'projects.assign_member',
        'teams.browse',
        'teams.read',
        'teams.add',
        'teams.edit',
        'teams.delete',
        'teams.add_member',
        'teams.remove_member',
        'teams.transfer_member',
        'tasks.browse',
        'tasks.read',
        'tasks.add',
        'tasks.edit',
        'tasks.delete',
        'tasks.assign',
        'tasks.transfer',
        'tasks.comment',
        'tasks.log_time',
        'timesheets.browse',
        'timesheets.log',
        'timesheets.edit_own',
        'timesheets.submit',
        'timesheets.approve',
        'timesheets.view_team',
        'timesheets.reports',
        'subtasks.browse',
        'subtasks.read',
        'subtasks.add',
        'subtasks.edit',
        'subtasks.delete',
        'comments.browse',
        'comments.read',
        'comments.add',
        'comments.edit',
      ].map((permissionName) => ({ roleId: 3, permissionName })),

      // Team Lead: operate assigned projects and coordinate team task delivery.
      ...[
        'projects.browse',
        'projects.read',
        'teams.browse',
        'teams.read',
        'teams.add_member',
        'teams.remove_member',
        'tasks.browse',
        'tasks.read',
        'tasks.add',
        'tasks.edit',
        'tasks.assign',
        'tasks.transfer',
        'tasks.comment',
        'tasks.log_time',
        'timesheets.browse',
        'timesheets.log',
        'timesheets.edit_own',
        'timesheets.submit',
        'timesheets.approve',
        'timesheets.view_team',
        'timesheets.reports',
        'subtasks.browse',
        'subtasks.read',
        'subtasks.add',
        'subtasks.edit',
        'comments.browse',
        'comments.read',
        'comments.add',
        'comments.edit',
      ].map((permissionName) => ({ roleId: 9, permissionName })),

      // Developer: work only inside projects made visible by membership.
      ...[
        'projects.browse',
        'projects.read',
        'teams.browse',
        'teams.read',
        'tasks.browse',
        'tasks.read',
        'tasks.add',
        'tasks.edit',
        'tasks.comment',
        'tasks.log_time',
        'timesheets.browse',
        'timesheets.log',
        'timesheets.edit_own',
        'timesheets.submit',
        'subtasks.browse',
        'subtasks.read',
        'subtasks.add',
        'subtasks.edit',
        'comments.browse',
        'comments.read',
        'comments.add',
        'comments.edit',
      ].map((permissionName) => ({ roleId: 10, permissionName })),

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
      } else {
      }
    }
  }
}
