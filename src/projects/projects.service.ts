import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ProjectsRepository } from './infrastructure/persistence/projects.repository';
import { Project } from './domain/project';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AssignTeamDto } from './dto/assign-team.dto';
import { AddClientDto } from './dto/add-client.dto';
import { IPaginationOptions } from '../common/types/pagination-options';
import { PaginationMetaDto } from '../common/dto/pagination-response.dto';
import { ProjectPriority } from './enums/project-priority.enum';
import { ProjectStatus } from './enums/project-status.enum';
import { ProjectVisibility } from './enums/project-visibility.enum';
import { JwtPayloadType } from '../auth/strategies/types/jwt-payload.type';
import { UsersService } from '../users/users.service';
import { TasksService } from '../tasks/tasks.service';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly repository: ProjectsRepository,
    private readonly usersService: UsersService,
    private readonly tasksService: TasksService,
  ) {}

  async findAll(
    currentUser: JwtPayloadType,
    paginationOptions?: IPaginationOptions,
    search?: string,
  ): Promise<{ items: Project[]; meta: PaginationMetaDto }> {
    const isAdmin = await this.isAdmin(currentUser);
    const result = await this.repository.findManyWithPagination({
      paginationOptions: paginationOptions || { page: 1, limit: 10 },
      search,
      userId: currentUser.id,
      isAdmin,
    });
    result.items = await Promise.all(result.items.map((p) => this.enrich(p)));
    return result;
  }

  async findById(id: string, currentUser: JwtPayloadType): Promise<Project> {
    const isAdmin = await this.isAdmin(currentUser);
    const item = await this.repository.findVisibleById(id, {
      userId: currentUser.id,
      isAdmin,
    });
    if (!item) {
      const exists = await this.repository.findById(id);
      if (exists) throw new ForbiddenException('You are not allowed to access this private project');
      throw new NotFoundException(`Project #${id} not found`);
    }
    return this.enrich(item);
  }

  private async enrich(project: Project): Promise<Project> {
    const [counts, owner] = await Promise.all([
      this.tasksService.getTaskCounts(project.id),
      project.projectManagerId
        ? this.usersService.findById(project.projectManagerId)
        : Promise.resolve(null),
    ]);
    project.totalTasks = counts.total;
    project.completedTasks = counts.completed;
    project.owner = owner
      ? { id: owner.id, firstName: owner.firstName ?? null, lastName: owner.lastName ?? null }
      : null;
    return project;
  }

  async create(dto: CreateProjectDto): Promise<Project> {
    let code = dto.code?.trim() || null;
    if (!code) {
      const nextNum = (await this.repository.nextCodeNumber()) + 1;
      code = `PRO-${nextNum.toString().padStart(3, '0')}`;
    }
    return this.repository.create({
      ...dto,
      code,
      priority: dto.priority ?? this.resolvePriority(dto.estimatedHours),
      visibility: dto.visibility ?? ProjectVisibility.PRIVATE,
      status: dto.status ?? ProjectStatus.PLANNING,
      isBillable: dto.isBillable ?? false,
      tags: dto.tags ?? [],
      attachments: dto.attachments ?? [],
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      endDate: dto.endDate ? new Date(dto.endDate) : null,
    });
  }

  async update(id: string, dto: UpdateProjectDto, changedBy?: string): Promise<Project> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException(`Project #${id} not found`);

    const payload: Partial<Project> = {
      ...dto,
      priority:
        dto.priority ??
        (dto.estimatedHours !== undefined
          ? this.resolvePriority(dto.estimatedHours)
          : undefined),
      startDate: dto.startDate !== undefined ? (dto.startDate ? new Date(dto.startDate) : null) : undefined,
      endDate: dto.endDate !== undefined ? (dto.endDate ? new Date(dto.endDate) : null) : undefined,
    };
    const item = await this.repository.update(id, payload);
    if (!item) throw new NotFoundException(`Project #${id} not found`);

    if (dto.status && dto.status !== existing.status && changedBy) {
      await this.repository.recordStatusChange({
        projectId: id,
        fromStatus: existing.status,
        toStatus: dto.status,
        changedBy,
        note: null,
      });
    }

    return item;
  }

  async getStatusHistory(id: string) {
    return this.repository.findStatusHistory(id);
  }

  async remove(id: string): Promise<void> {
    await this.repository.remove(id);
  }

  async assignTeam(id: string, dto: AssignTeamDto): Promise<Project> {
    const item = await this.repository.update(id, { assignedTeamId: dto.assignedTeamId });
    if (!item) throw new NotFoundException(`Project #${id} not found`);
    return item;
  }

  private resolvePriority(estimatedHours?: number): ProjectPriority {
    if (!estimatedHours || estimatedHours <= 100) {
      return ProjectPriority.FOUNDATION;
    }
    if (estimatedHours <= 400) {
      return ProjectPriority.ADVANCED;
    }

      return ProjectPriority.STRATEGIC;
    
   
  }

  async addClient(projectId: string, dto: AddClientDto, addedBy: string): Promise<void> {
    const exists = await this.repository.findById(projectId);
    if (!exists) throw new NotFoundException(`Project #${projectId} not found`);
    const clients = await this.repository.findClients(projectId);
    if (clients.some((c) => c.userId === dto.userId)) {
      throw new ConflictException('User is already a client on this project');
    }
    await this.repository.addClient(projectId, dto.userId, addedBy, dto.role ?? 'client');
  }

  async removeClient(projectId: string, userId: string): Promise<void> {
    await this.repository.removeClient(projectId, userId);
  }

  async findClients(projectId: string) {
    return this.repository.findClients(projectId);
  }

  async getPortalUsers(projectId: string) {
    return this.repository.findProjectUsers(projectId);
  }

  async getProjectsByUser(userId: string): Promise<Project[]> {
    return this.repository.findProjectsByUserId(userId);
  }

  async getCompletionPercentage(projectId: string): Promise<number> {
    return this.tasksService.getCompletionPercentage(projectId);
  }

  private async isAdmin(currentUser: JwtPayloadType): Promise<boolean> {
    const tokenRole = currentUser.role;
    if (
      String(tokenRole?.id) === '1' ||
      String(tokenRole?.name ?? '').toLowerCase() === 'admin'
    ) {
      return true;
    }

    const roles = await this.usersService.getUserRoles(currentUser.id);
    return roles.some(
      (role) =>
        String(role?.id) === '1' ||
        String(role?.name ?? '').toLowerCase() === 'admin',
    );
  }
}
