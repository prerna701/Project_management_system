import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TasksRepository } from './infrastructure/persistence/tasks.repository';
import { Task } from './domain/task';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { IPaginationOptions } from '../common/types/pagination-options';
import { PaginationMetaDto } from '../common/dto/pagination-response.dto';
import { TaskPriority } from './enums/task-priority.enum';
import { TaskStatus } from './enums/task-status.enum';
import { MilestonesService } from '../milestones/milestones.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ProjectsRepository } from '../projects/infrastructure/persistence/projects.repository';
import { UserRepository } from '../users/infrastructure/persistence/user.repository';
import { JwtPayloadType } from '../auth/strategies/types/jwt-payload.type';
import { RoleEnum } from '../roles/roles.enum';
import { WorkEvidenceService } from '../work-evidence/work-evidence.service';
import { WorkActivityEventType } from '../work-evidence/enums/work-activity-event-type.enum';

@Injectable()
export class TasksService {
  constructor(
    private readonly repository: TasksRepository,
    private readonly projectsRepository: ProjectsRepository,
    private readonly userRepository: UserRepository,
    private readonly milestonesService: MilestonesService,
    private readonly notificationsService: NotificationsService,
    private readonly workEvidenceService: WorkEvidenceService,
  ) {}

  async findAll(
    currentUser: JwtPayloadType,
    paginationOptions?: IPaginationOptions,
    search?: string,
  ): Promise<{ items: Task[]; meta: PaginationMetaDto }> {
    const access = await this.getAccessOptions(currentUser);
    return this.repository.findManyWithPagination({
      paginationOptions: paginationOptions || { page: 1, limit: 10 },
      search,
      parentTaskId: null,
      access,
    });
  }

  async findByProject(
    projectId: string,
    currentUser: JwtPayloadType,
    paginationOptions?: IPaginationOptions,
    search?: string,
  ): Promise<{ items: Task[]; meta: PaginationMetaDto }> {
    const access = await this.assertProjectAccess(projectId, currentUser);
    return this.repository.findManyWithPagination({
      paginationOptions: paginationOptions || { page: 1, limit: 100 },
      search,
      projectId,
      parentTaskId: null,
      access,
    });
  }

  async createForProject(
    projectId: string,
    dto: CreateTaskDto & { milestoneId?: string },
    currentUser: JwtPayloadType,
  ): Promise<Task> {
    await this.assertProjectAccess(projectId, currentUser);
    const assigneeId = await this.resolveTaskAssignee(
      projectId,
      dto.assigneeId,
      currentUser,
    );
    const item = await this.repository.create({
      projectId,
      milestoneId: dto.milestoneId ?? null,
      sprintId: (dto as any).sprintId ?? null,
      title: dto.title,
      description: dto.description ?? null,
      assigneeId,
      reporterId: dto.reporterId ?? currentUser.id,
      priority: dto.priority ?? TaskPriority.MEDIUM,
      status: dto.status ?? TaskStatus.OPEN,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      estimatedHours: dto.estimatedHours ?? null,
      loggedHours: 0,
      isBillable: dto.isBillable ?? false,
      dependencies: [],
      attachments: [],
      labels: dto.labels ?? [],
      checklist: [],
    });
    this.notifyAssignment(item, currentUser.id);
    this.recordTaskActivitySafely(
      item,
      currentUser.id,
      WorkActivityEventType.TASK_CREATED,
    );
    return item;
  }

  async findByMilestone(
    milestoneId: string,
    currentUser: JwtPayloadType,
    paginationOptions?: IPaginationOptions,
    search?: string,
  ): Promise<{ items: Task[]; meta: PaginationMetaDto }> {
    const milestone = await this.milestonesService.findById(milestoneId);
    const access = await this.assertProjectAccess(milestone.projectId, currentUser);
    return this.repository.findManyWithPagination({
      paginationOptions: paginationOptions || { page: 1, limit: 10 },
      search,
      milestoneId,
      parentTaskId: null,
      access,
    });
  }

  async findSubtasks(
    parentTaskId: string,
    currentUser: JwtPayloadType,
    paginationOptions?: IPaginationOptions,
  ): Promise<{ items: Task[]; meta: PaginationMetaDto }> {
    const parent = await this.findById(parentTaskId, currentUser);
    const access = await this.getAccessOptions(currentUser);
    return this.repository.findManyWithPagination({
      paginationOptions: paginationOptions || { page: 1, limit: 50 },
      parentTaskId: parent.id,
      access,
    });
  }

  async findById(id: string, currentUser?: JwtPayloadType): Promise<Task> {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundException(`Task #${id} not found`);
    if (currentUser) await this.assertTaskAccess(item, currentUser);
    return item;
  }

  async createForMilestone(
    milestoneId: string,
    dto: CreateTaskDto & { projectId: string },
    currentUser: JwtPayloadType,
  ): Promise<Task> {
    await this.assertProjectAccess(dto.projectId, currentUser);
    const assigneeId = await this.resolveTaskAssignee(
      dto.projectId,
      dto.assigneeId,
      currentUser,
    );
    const item = await this.repository.create({
      projectId: dto.projectId,
      milestoneId,
      title: dto.title,
      description: dto.description ?? null,
      assigneeId,
      reporterId: dto.reporterId ?? currentUser.id,
      priority: dto.priority ?? TaskPriority.MEDIUM,
      status: dto.status ?? TaskStatus.OPEN,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      estimatedHours: dto.estimatedHours ?? null,
      loggedHours: 0,
      isBillable: dto.isBillable ?? false,
      dependencies: dto.dependencies ?? [],
      attachments: dto.attachments ?? [],
      labels: dto.labels ?? [],
      checklist: [],
    });
    this.notifyAssignment(item, currentUser.id);
    this.recordTaskActivitySafely(
      item,
      currentUser.id,
      WorkActivityEventType.TASK_CREATED,
    );
    return item;
  }

  async update(
    id: string,
    dto: UpdateTaskDto,
    currentUser: JwtPayloadType,
  ): Promise<Task> {
    const accessibleTask = await this.findById(id, currentUser);
    await this.assertTaskWriteAccess(accessibleTask, currentUser);
    if (dto.milestoneId !== undefined && dto.milestoneId !== null) {
      await this.ensureMilestoneBelongsToTaskProject(id, dto.milestoneId);
    }

    const oldTask = dto.status ? await this.repository.findById(id) : null;

    const payload: Partial<Task> = {
      ...dto,
      startDate: dto.startDate !== undefined ? (dto.startDate ? new Date(dto.startDate) : null) : undefined,
      dueDate: dto.dueDate !== undefined ? (dto.dueDate ? new Date(dto.dueDate) : null) : undefined,
    };
    const item = await this.repository.update(id, payload);
    if (!item) throw new NotFoundException(`Task #${id} not found`);

    if (
      dto.status &&
      oldTask?.status !== dto.status &&
      item.reporterId
    ) {
      this.notificationsService
        .notifyTaskStatusChanged({
          taskId: item.id,
          taskTitle: item.title,
          newStatus: dto.status,
          reporterId: item.reporterId,
          assigneeId: item.assigneeId,
          changedById: currentUser.id,
          previousStatus: oldTask?.status,
        })
        .catch(() => undefined);
    }

    this.recordTaskActivitySafely(
      item,
      currentUser.id,
      dto.status && oldTask?.status !== dto.status
        ? WorkActivityEventType.TASK_STATUS_CHANGED
        : WorkActivityEventType.TASK_UPDATED,
      dto.status
        ? { previousStatus: oldTask?.status, newStatus: dto.status }
        : {},
    );
    return item;
  }

  async remove(id: string, currentUser: JwtPayloadType): Promise<void> {
    const task = await this.findById(id, currentUser);
    await this.assertTaskWriteAccess(task, currentUser);
    await this.repository.remove(id);
  }

  async assignTask(
    id: string,
    dto: AssignTaskDto,
    currentUser: JwtPayloadType,
  ): Promise<Task> {
    const existing = await this.findById(id, currentUser);
    await this.assertProjectManagerAccess(existing.projectId, currentUser);
    await this.assertValidAssignee(existing.projectId, dto.assigneeId);
    const item = await this.repository.update(id, { assigneeId: dto.assigneeId });
    if (!item) throw new NotFoundException(`Task #${id} not found`);

    if (dto.assigneeId && dto.assigneeId !== existing.assigneeId) {
      const context = await this.getNotificationContext(item.projectId, currentUser.id);
      this.notificationsService
        .notifyTaskReassigned({
          taskId: item.id,
          taskTitle: item.title,
          assigneeId: dto.assigneeId,
          assignedById: currentUser.id,
          projectId: item.projectId,
          projectName: context.projectName,
          actorName: context.actorName,
          previousAssigneeId: existing.assigneeId,
        })
        .catch(() => undefined);
    }

    this.recordTaskActivitySafely(
      item,
      currentUser.id,
      WorkActivityEventType.TASK_ASSIGNED,
      {
        previousAssigneeId: existing.assigneeId,
        assigneeId: dto.assigneeId,
      },
    );
    return item;
  }

  async createSubtask(
    parentTaskId: string,
    dto: CreateSubtaskDto,
    currentUser: JwtPayloadType,
  ): Promise<Task> {
    const parent = await this.findById(parentTaskId, currentUser);
    const assigneeId = await this.resolveTaskAssignee(
      parent.projectId,
      dto.assigneeId,
      currentUser,
    );
    const item = await this.repository.create({
      projectId: parent.projectId,
      milestoneId: parent.milestoneId,
      parentTaskId,
      title: dto.title,
      description: null,
      assigneeId,
      reporterId: currentUser.id,
      priority: TaskPriority.MEDIUM,
      status: dto.status ?? TaskStatus.OPEN,
      startDate: null,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      estimatedHours: null,
      loggedHours: 0,
      isBillable: parent.isBillable,
      dependencies: [],
      attachments: [],
      labels: [],
      checklist: dto.checklist ?? [],
    });
    this.notifyAssignment(item, currentUser.id);
    this.recordTaskActivitySafely(
      item,
      currentUser.id,
      WorkActivityEventType.SUBTASK_CREATED,
      { parentTaskId },
    );
    return item;
  }

  async reassignOpenTasks(fromUserId: string, toUserId: string): Promise<void> {
    await this.repository.reassignOpenTasks(fromUserId, toUserId);
  }

  async getTaskCounts(projectId: string): Promise<{ total: number; completed: number }> {
    return this.repository.countByProjectId(projectId);
  }

  async getCompletionPercentage(projectId: string): Promise<number> {
    const { total, completed } = await this.repository.countByProjectId(projectId);
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  }

  private async ensureMilestoneBelongsToTaskProject(
    taskId: string,
    milestoneId: string,
  ): Promise<void> {
    const task = await this.findById(taskId);
    const milestone = await this.milestonesService.findById(milestoneId);

    if (milestone.projectId !== task.projectId) {
      throw new BadRequestException('Milestone does not belong to the task project');
    }
  }

  private recordTaskActivitySafely(
    task: Task,
    userId: string,
    type: WorkActivityEventType,
    metadata: Record<string, unknown> = {},
  ): void {
    this.workEvidenceService
      .recordActivity({
        userId,
        projectId: task.projectId,
        taskId: task.parentTaskId ?? task.id,
        type,
        metadata: { affectedTaskId: task.id, ...metadata },
      })
      .catch(() => undefined);
  }

  private async assertTaskAccess(
    task: Task,
    currentUser: JwtPayloadType,
  ): Promise<void> {
    const access = await this.getAccessOptions(currentUser);
    if (
      access.isAdmin ||
      task.assigneeId === currentUser.id ||
      task.reporterId === currentUser.id
    ) {
      return;
    }
    await this.assertProjectAccess(task.projectId, currentUser, access);
  }

  private async assertTaskWriteAccess(
    task: Task,
    currentUser: JwtPayloadType,
  ): Promise<void> {
    const access = await this.getAccessOptions(currentUser);
    if (
      access.isAdmin ||
      task.assigneeId === currentUser.id ||
      task.reporterId === currentUser.id ||
      (await this.projectsRepository.canManageProject(
        task.projectId,
        currentUser.id,
      ))
    ) {
      return;
    }
    throw new ForbiddenException('You are not allowed to modify this task');
  }

  private async assertProjectManagerAccess(
    projectId: string,
    currentUser: JwtPayloadType,
  ): Promise<void> {
    const access = await this.getAccessOptions(currentUser);
    if (
      access.isAdmin ||
      (await this.projectsRepository.canManageProject(projectId, currentUser.id))
    ) {
      return;
    }
    throw new ForbiddenException(
      'Only the project creator, project manager, team leader, or admin can assign tasks',
    );
  }

  private async assertProjectAccess(
    projectId: string,
    currentUser: JwtPayloadType,
    existingAccess?: { userId: string; isAdmin: boolean },
  ) {
    const access = existingAccess ?? (await this.getAccessOptions(currentUser));
    const project = await this.projectsRepository.findVisibleById(projectId, access);
    if (!project) {
      throw new ForbiddenException('You are not allowed to access this project');
    }
    return access;
  }

  private async getAccessOptions(currentUser: JwtPayloadType) {
    const tokenRole = currentUser.role;
    if (
      String(tokenRole?.id) === RoleEnum.admin.toString() ||
      String(tokenRole?.name ?? '').toLowerCase() === 'admin'
    ) {
      return { userId: currentUser.id, isAdmin: true };
    }

    const roles = await this.userRepository.getUserRoles(currentUser.id);
    const isAdmin = roles.some(
      (role) =>
        String(role?.id) === RoleEnum.admin.toString() ||
        String(role?.name ?? '').toLowerCase() === 'admin',
    );
    return { userId: currentUser.id, isAdmin };
  }

  private notifyAssignment(task: Task, assignedById: string): void {
    if (!task.assigneeId) return;
    this.getNotificationContext(task.projectId, assignedById)
      .then((context) =>
        this.notificationsService.notifyTaskAssigned({
          taskId: task.id,
          taskTitle: task.title,
          assigneeId: task.assigneeId!,
          assignedById,
          projectId: task.projectId,
          projectName: context.projectName,
          actorName: context.actorName,
        }),
      )
      .catch(() => undefined);
  }

  private async getNotificationContext(projectId: string, actorId: string) {
    const [project, actor] = await Promise.all([
      this.projectsRepository.findById(projectId),
      this.userRepository.findById(actorId),
    ]);
    return {
      projectName: project?.name ?? '',
      actorName:
        [actor?.firstName, actor?.lastName].filter(Boolean).join(' ') ||
        'a manager',
    };
  }

  private async assertValidAssignee(
    projectId: string,
    assigneeId?: string | null,
  ): Promise<void> {
    if (!assigneeId) return;
    if (
      !(await this.projectsRepository.isProjectParticipant(
        projectId,
        assigneeId,
      ))
    ) {
      throw new BadRequestException(
        'The assignee must be the project manager, creator, or an active member of the assigned team',
      );
    }
  }

  private async resolveTaskAssignee(
    projectId: string,
    requestedAssigneeId: string | null | undefined,
    currentUser: JwtPayloadType,
  ): Promise<string | null> {
    const canAssign = await this.canAssignTasks(currentUser);

    if (!canAssign) {
      if (
        requestedAssigneeId &&
        String(requestedAssigneeId) !== String(currentUser.id)
      ) {
        throw new ForbiddenException(
          'You cannot assign tasks to another user',
        );
      }
      await this.assertValidAssignee(projectId, currentUser.id);
      return currentUser.id;
    }

    await this.assertValidAssignee(projectId, requestedAssigneeId);
    return requestedAssigneeId ?? null;
  }

  private async canAssignTasks(currentUser: JwtPayloadType): Promise<boolean> {
    const roles = await this.userRepository.getUserRoles(currentUser.id);
    const isAdmin =
      String(currentUser.role?.id) === RoleEnum.admin.toString() ||
      String(currentUser.role?.name ?? '').toLowerCase() === 'admin' ||
      roles.some(
        (role) =>
          String(role?.id) === RoleEnum.admin.toString() ||
          String(role?.name ?? '').toLowerCase() === 'admin',
      );
    if (isAdmin) return true;

    const roleIds = [
      ...new Set([
        Number(currentUser.role?.id),
        ...roles.map((role) => Number(role.id)),
      ]),
    ].filter((roleId) => Number.isFinite(roleId));
    const permissions = await this.userRepository.getUserPermissions(
      currentUser.id,
      roleIds,
    );
    return permissions.some(
      (permission) =>
        String(permission?.name ?? '').toLowerCase() === 'tasks.assign',
    );
  }
}
