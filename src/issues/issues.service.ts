import { Injectable, NotFoundException } from '@nestjs/common';
import { IssuesRepository } from './infrastructure/persistence/issues.repository';
import { Issue } from './domain/issue';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueStatusDto } from './dto/update-issue-status.dto';
import { IPaginationOptions } from '../common/types/pagination-options';
import { PaginationMetaDto } from '../common/dto/pagination-response.dto';
import { IssueStatus } from './enums/issue-status.enum';
import { ProjectsRepository } from '../projects/infrastructure/persistence/projects.repository';

@Injectable()
export class IssuesService {
  constructor(
    private readonly repository: IssuesRepository,
    private readonly projectsRepository: ProjectsRepository,
  ) {}

  async create(dto: CreateIssueDto, raisedBy: string): Promise<Issue> {
    let assignedToId: string | null = null;

    if (dto.taskId || dto.subtaskId) {
      const project = await this.projectsRepository.findById(dto.projectId);
      assignedToId = project?.projectManagerId ?? null;
    }

    return this.repository.create({
      projectId: dto.projectId,
      milestoneId: dto.milestoneId ?? null,
      taskId: dto.taskId ?? null,
      subtaskId: dto.subtaskId ?? null,
      title: dto.title,
      description: dto.description ?? null,
      status: dto.status ?? IssueStatus.OPEN,
      raisedBy,
      assignedToId,
    });
  }

  async findByProject(
    projectId: string,
    paginationOptions?: IPaginationOptions,
    search?: string,
  ): Promise<{ items: Issue[]; meta: PaginationMetaDto }> {
    return this.repository.findByProject(projectId, {
      paginationOptions: paginationOptions || { page: 1, limit: 10 },
      search,
    });
  }

  async findById(id: string): Promise<Issue> {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundException(`Issue #${id} not found`);
    return item;
  }

  async updateStatus(id: string, dto: UpdateIssueStatusDto): Promise<Issue> {
    await this.findById(id);
    const item = await this.repository.update(id, { status: dto.status });
    if (!item) throw new NotFoundException(`Issue #${id} not found`);
    return item;
  }
}
