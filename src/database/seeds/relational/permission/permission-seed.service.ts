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
      // Teams
      { name: 'teams.browse', label: 'Browse Teams', module: 'teams' },
      { name: 'teams.read', label: 'Read Teams', module: 'teams' },
      { name: 'teams.add', label: 'Add Teams', module: 'teams' },
      { name: 'teams.edit', label: 'Edit Teams', module: 'teams' },
      { name: 'teams.delete', label: 'Delete Teams', module: 'teams' },
      { name: 'teams.add_member', label: 'Add Team Member', module: 'teams' },
      { name: 'teams.remove_member', label: 'Remove Team Member', module: 'teams' },
      { name: 'teams.transfer_member', label: 'Transfer Team Member', module: 'teams' },
      // Projects
      { name: 'projects.browse', label: 'Browse Projects', module: 'projects' },
      { name: 'projects.read', label: 'Read Projects', module: 'projects' },
      { name: 'projects.add', label: 'Add Projects', module: 'projects' },
      { name: 'projects.edit', label: 'Edit Projects', module: 'projects' },
      { name: 'projects.delete', label: 'Delete Projects', module: 'projects' },
      { name: 'projects.assign_team', label: 'Assign Team to Project', module: 'projects' },
      { name: 'projects.assign_member', label: 'Assign Member to Project', module: 'projects' },
      // Milestones
      { name: 'milestones.browse', label: 'Browse Milestones', module: 'milestones' },
      { name: 'milestones.read', label: 'Read Milestones', module: 'milestones' },
      { name: 'milestones.add', label: 'Add Milestones', module: 'milestones' },
      { name: 'milestones.edit', label: 'Edit Milestones', module: 'milestones' },
      { name: 'milestones.delete', label: 'Delete Milestones', module: 'milestones' },
      // Tasks
      { name: 'tasks.browse', label: 'Browse Tasks', module: 'tasks' },
      { name: 'tasks.read', label: 'Read Tasks', module: 'tasks' },
      { name: 'tasks.add', label: 'Add Tasks', module: 'tasks' },
      { name: 'tasks.edit', label: 'Edit Tasks', module: 'tasks' },
      { name: 'tasks.delete', label: 'Delete Tasks', module: 'tasks' },
      { name: 'tasks.assign', label: 'Assign Tasks', module: 'tasks' },
      { name: 'tasks.transfer', label: 'Transfer Tasks', module: 'tasks' },
      { name: 'tasks.comment', label: 'Comment on Tasks', module: 'tasks' },
      { name: 'tasks.log_time', label: 'Log Time on Tasks', module: 'tasks' },
      // Timesheets
      { name: 'timesheets.browse', label: 'Browse Own Timesheets', module: 'timesheets' },
      { name: 'timesheets.log', label: 'Log Time', module: 'timesheets' },
      { name: 'timesheets.edit_own', label: 'Edit Own Time Logs', module: 'timesheets' },
      { name: 'timesheets.submit', label: 'Submit Time Logs', module: 'timesheets' },
      { name: 'timesheets.approve', label: 'Approve Time Logs', module: 'timesheets' },
      { name: 'timesheets.view_team', label: 'View Team Timesheets', module: 'timesheets' },
      { name: 'timesheets.reports', label: 'View Timesheet Reports', module: 'timesheets' },
      { name: 'timesheets.view_evidence', label: 'View Timesheet Evidence', module: 'timesheets' },
      { name: 'integrations.browse', label: 'Browse Integrations', module: 'integrations' },
      { name: 'integrations.add', label: 'Add Integrations', module: 'integrations' },
      { name: 'integrations.edit', label: 'Edit Integrations', module: 'integrations' },
      { name: 'integrations.delete', label: 'Delete Integrations', module: 'integrations' },
      // Subtasks
      { name: 'subtasks.browse', label: 'Browse Subtasks', module: 'subtasks' },
      { name: 'subtasks.read', label: 'Read Subtasks', module: 'subtasks' },
      { name: 'subtasks.add', label: 'Add Subtasks', module: 'subtasks' },
      { name: 'subtasks.edit', label: 'Edit Subtasks', module: 'subtasks' },
      { name: 'subtasks.delete', label: 'Delete Subtasks', module: 'subtasks' },
      // Comments
      { name: 'comments.browse', label: 'Browse Comments', module: 'comments' },
      { name: 'comments.read', label: 'Read Comments', module: 'comments' },
      { name: 'comments.add', label: 'Add Comments', module: 'comments' },
      { name: 'comments.edit', label: 'Edit Comments', module: 'comments' },
      { name: 'comments.delete', label: 'Delete Comments', module: 'comments' },
    ];

    for (const perm of permissions) {
      const existing = await this.permissionRepo.findOne({ where: { name: perm.name } });
      if (!existing) {
        await this.permissionRepo.save(this.permissionRepo.create(perm));
      } else {
        if (
          existing.label !== perm.label ||
          existing.module !== perm.module
        ) {
          await this.permissionRepo.save(
            this.permissionRepo.merge(existing, {
              label: perm.label,
              module: perm.module,
            }),
          );
        }
      }
    }
  }
}
