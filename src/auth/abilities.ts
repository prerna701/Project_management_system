import { AbilityBuilder, createMongoAbility, MongoAbility } from '@casl/ability';
import { RoleEnum } from '../roles/roles.enum';

export type Actions =
  | 'manage'
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'browse'
  | 'add'
  | 'edit'
  | 'approve'
  | 'reject'
  | 'assign'
  | 'add_member'
  | 'remove_member'
  | 'transfer_member'
  | 'assign_team'
  | 'assign_member'
  | 'comment'
  | 'log_time'
  | 'log'
  | 'edit_own'
  | 'submit'
  | 'view_team'
  | 'reports';

export type Subjects =
  | 'User'
  | 'Role'
  | 'Permission'
  | 'users'
  | 'roles'
  | 'permissions'
  | 'tasks'
  | 'subtasks'
  | 'projects'
  | 'project_clients'
  | 'project_users'
  | 'project_tags'
  | 'milestones'
  | 'teams'
  | 'comments'
  | 'notifications'
  | 'timesheets'
  | 'all';

export type AppAbility = MongoAbility<[Actions, Subjects]>;

export function defineAbilitiesFor(
  user: any,
  permissionLabels: string[],
  rolesName: any[],
): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  const roleNames = rolesName.map((role) =>
    (role.name || role).toString().toLowerCase(),
  );
  const roleIds = rolesName.map((role) => (role.id || role).toString());

  if (
    roleIds.includes(RoleEnum.admin.toString()) ||
    roleNames.includes('admin')
  ) { 
    can('manage', 'all'); 
  } else {
    permissionLabels.forEach((perm) => {
      const [subjectRaw, actionRaw] = perm.split('.');
      if (!subjectRaw || !actionRaw) return;
      const action = actionRaw.toLowerCase() as Actions;
      can(action, subjectRaw as Subjects);
    });
  }

  return build();
}
