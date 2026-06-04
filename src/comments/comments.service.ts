import { ForbiddenException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { ProjectsRepository } from '../projects/infrastructure/persistence/projects.repository';
import { UserRepository } from '../users/infrastructure/persistence/user.repository';

export type CommentProjectAction = 'browse' | 'add' | 'reply' | 'edit' | 'delete' | 'mention';

@Injectable()
export class CommentsService {
  constructor(
    private readonly projectsRepository: ProjectsRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async assertCanAccessProjectComments(
    projectId: string,
    userId: string,
    action: CommentProjectAction,
  ): Promise<void> {
    if (await this.canAccessProjectComments(projectId, userId, action)) return;
    throw new ForbiddenException(`You are not allowed to ${action} comments for this project`);
  }

  async assertMentionedUsersBelongToProject(projectId: string, mentions?: string[]): Promise<void> {
    if (!mentions?.length) return;

    const projectUsers = await this.projectsRepository.findProjectUsers(projectId);
    const allowedIds = new Set(projectUsers.map((user) => user.userId));
    const invalidMentions = mentions.filter((userId) => !allowedIds.has(userId));

    if (invalidMentions.length > 0) {
      throw new UnprocessableEntityException({
        status: 422,
        errors: {
          mentions: 'One or more mentioned users do not belong to this project',
        },
      });
    }
  }

  async canAccessProjectComments(
    projectId: string,
    userId: string,
    action: CommentProjectAction,
  ): Promise<boolean> {
    if (await this.isAdmin(userId)) return true;

    const project = await this.projectsRepository.findById(projectId);
    if (!project) throw new NotFoundException(`Project #${projectId} not found`);
    if (project.projectManagerId === userId) return true;

    const projectUsers = await this.projectsRepository.findProjectUsers(projectId);
    const isProjectUser = projectUsers.some((projectUser) => projectUser.userId === userId);
    if (isProjectUser && ['browse', 'add', 'reply', 'mention'].includes(action)) return true;

    return this.userRepository.hasUserPermission(
      userId,
      `comments.${action}`,
      projectId,
      'PROJECT',
    );
  }

  private async isAdmin(userId: string): Promise<boolean> {
    const roles = await this.userRepository.getUserRoles(userId);
    return roles.some(
      (role) =>
        String(role?.id) === '1' ||
        String(role?.name ?? '').toLowerCase() === 'admin',
    );
  }
}
