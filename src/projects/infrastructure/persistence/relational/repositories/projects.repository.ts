import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectEntity } from '../entities/project.entity';
import { ProjectStatusHistoryEntity } from '../entities/project-status-history.entity';
import { ProjectClientEntity } from '../entities/project-client.entity';
import { ProjectsRepository } from '../../projects.repository';
import { Project } from '../../../../domain/project';
import { ProjectStatusHistory } from '../../../../domain/project-status-history';
import { ProjectMapper } from '../mappers/project.mapper';
import { IPaginationOptions } from '../../../../../common/types/pagination-options';
import { PaginationMetaDto } from '../../../../../common/dto/pagination-response.dto';
import { ProjectVisibility } from '../../../../enums/project-visibility.enum';

@Injectable()
export class RelationalProjectsRepository implements ProjectsRepository {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly repo: Repository<ProjectEntity>,
    @InjectRepository(ProjectStatusHistoryEntity)
    private readonly statusHistoryRepo: Repository<ProjectStatusHistoryEntity>,
    @InjectRepository(ProjectClientEntity)
    private readonly clientRepo: Repository<ProjectClientEntity>,
  ) {}

  async findById(id: string): Promise<Project | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? ProjectMapper.toDomain(entity) : null;
  }

  async findVisibleById(
    id: string,
    options: { userId: string; isAdmin: boolean },
  ): Promise<Project | null> {
    const query = this.repo
      .createQueryBuilder('project')
      .where('project.id = :id', { id })
      .andWhere('project.deletedAt IS NULL');

    this.applyVisibilityFilter(query, options);

    const entity = await query.getOne();
    return entity ? ProjectMapper.toDomain(entity) : null;
  }

  async findManyWithPagination(options: {
    paginationOptions: IPaginationOptions;
    search?: string;
    userId?: string;
    isAdmin?: boolean;
  }): Promise<{ items: Project[]; meta: PaginationMetaDto }> {
    const { paginationOptions, search } = options;
    const query = this.repo.createQueryBuilder('project').where('project.deletedAt IS NULL');

    if (options.userId) {
      this.applyVisibilityFilter(query, {
        userId: options.userId,
        isAdmin: options.isAdmin ?? false,
      });
    }

    if (search) {
      query.andWhere(
        '(project.name ILIKE :search OR project.code ILIKE :search OR project.clientName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const totalItems = await query.getCount();
    const { page, limit } = paginationOptions;

    const entities = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('project.createdAt', 'DESC')
      .getMany();

    return {
      items: entities.map(ProjectMapper.toDomain),
      meta: { currentPage: page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
    };
  }

  async create(item: Partial<Project>): Promise<Project> {
    const entity = this.repo.create(ProjectMapper.toPersistence(item) as ProjectEntity);
    const saved = await this.repo.save(entity);
    return ProjectMapper.toDomain(saved);
  }

  async update(id: string, item: Partial<Project>): Promise<Project | null> {
    await this.repo.update(id, ProjectMapper.toPersistence(item) as any);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }

  async recordStatusChange(
    entry: Omit<ProjectStatusHistory, 'id' | 'createdAt'>,
  ): Promise<ProjectStatusHistory> {
    const saved = await this.statusHistoryRepo.save(
      this.statusHistoryRepo.create({
        projectId: entry.projectId,
        fromStatus: entry.fromStatus,
        toStatus: entry.toStatus,
        changedBy: entry.changedBy,
        note: entry.note ?? null,
      }),
    );
    const result = new ProjectStatusHistory();
    result.id = saved.id;
    result.projectId = saved.projectId;
    result.fromStatus = saved.fromStatus;
    result.toStatus = saved.toStatus;
    result.changedBy = saved.changedBy;
    result.note = saved.note;
    result.createdAt = saved.createdAt;
    return result;
  }

  async findStatusHistory(projectId: string): Promise<ProjectStatusHistory[]> {
    const rows = await this.statusHistoryRepo.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
    });
    return rows.map((r) => {
      const item = new ProjectStatusHistory();
      item.id = r.id;
      item.projectId = r.projectId;
      item.fromStatus = r.fromStatus;
      item.toStatus = r.toStatus;
      item.changedBy = r.changedBy;
      item.note = r.note;
      item.createdAt = r.createdAt;
      return item;
    });
  }

  async findProjectsByUserId(userId: string): Promise<Project[]> {
    const query = this.repo
      .createQueryBuilder('project')
      .where('project.deletedAt IS NULL')
      .andWhere(
        `(
          project.projectManagerId = :userId
          OR EXISTS (
            SELECT 1 FROM team_members tm
            WHERE tm."teamId" = project."assignedTeamId"
              AND tm."userId" = :userId
              AND tm."isActive" = true
          )
          OR EXISTS (
            SELECT 1 FROM project_clients pc
            WHERE pc."projectId" = project."id"
              AND pc."userId" = :userId
          )
        )`,
        { userId },
      )
      .orderBy('project.createdAt', 'DESC');

    const entities = await query.getMany();
    return entities.map(ProjectMapper.toDomain);
  }

  async findProjectUsers(projectId: string): Promise<{ userId: string; role: string }[]> {
    const rows = await this.repo.manager.query(
      `SELECT DISTINCT u_id AS "userId", role FROM (
        SELECT p."projectManagerId" AS u_id, 'project_manager' AS role
        FROM projects p
        WHERE p.id = $1 AND p."projectManagerId" IS NOT NULL
        UNION ALL
        SELECT tm."userId" AS u_id, 'team_member' AS role
        FROM team_members tm
        JOIN projects p ON p."assignedTeamId" = tm."teamId"
        WHERE p.id = $1 AND tm."isActive" = true
        UNION ALL
        SELECT pc."userId" AS u_id, pc."role" AS role
        FROM project_clients pc
        WHERE pc."projectId" = $1
      ) AS combined`,
      [projectId],
    );
    return rows as { userId: string; role: string }[];
  }

  async addClient(projectId: string, userId: string, addedBy: string, role = 'client'): Promise<void> {
    await this.clientRepo
      .createQueryBuilder()
      .insert()
      .into(ProjectClientEntity)
      .values({ projectId, userId, addedBy, role })
      .orIgnore()
      .execute();
  }

  async removeClient(projectId: string, userId: string): Promise<void> {
    await this.clientRepo.delete({ projectId, userId });
  }

  async findClients(projectId: string): Promise<{ id: string; userId: string; role: string; addedBy: string; createdAt: Date }[]> {
    const rows = await this.clientRepo.find({ where: { projectId }, order: { createdAt: 'ASC' } });
    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      role: r.role,
      addedBy: r.addedBy,
      createdAt: r.createdAt,
    }));
  }

  private applyVisibilityFilter(
    query: ReturnType<Repository<ProjectEntity>['createQueryBuilder']>,
    options: { userId: string; isAdmin: boolean },
  ): void {
    if (options.isAdmin) return;

    query.andWhere(
      `(
        project.visibility = :publicVisibility
        OR project.projectManagerId = :userId
        OR EXISTS (
          SELECT 1
          FROM team_members team_member
          WHERE team_member."teamId" = project."assignedTeamId"
            AND team_member."userId" = :userId
            AND team_member."isActive" = true
        )
      )`,
      {
        publicVisibility: ProjectVisibility.PUBLIC,
        userId: options.userId,
      },
    );
  }
}
