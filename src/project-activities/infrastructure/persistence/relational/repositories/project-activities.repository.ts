import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectActivityEntity } from '../entities/project-activity.entity';
import { ProjectActivitiesRepository } from '../../project-activities.repository';
import { ProjectActivity } from '../../../../domain/project-activity';
import { ProjectActivityMapper } from '../mappers/project-activity.mapper';
import { IPaginationOptions } from '../../../../../common/types/pagination-options';
import { PaginationMetaDto } from '../../../../../common/dto/pagination-response.dto';

@Injectable()
export class RelationalProjectActivitiesRepository implements ProjectActivitiesRepository {
  constructor(
    @InjectRepository(ProjectActivityEntity)
    private readonly repo: Repository<ProjectActivityEntity>,
  ) {}

  async log(item: Omit<ProjectActivity, 'id' | 'createdAt'>): Promise<ProjectActivity> {
    const entity = this.repo.create(ProjectActivityMapper.toPersistence(item as ProjectActivity) as ProjectActivityEntity);
    const saved = await this.repo.save(entity);
    return ProjectActivityMapper.toDomain(saved);
  }

  async findMany(
    options: {
      paginationOptions: IPaginationOptions;
      projectId?: string;
      milestoneId?: string;
      taskId?: string;
      subtaskId?: string;
    },
  ): Promise<{ items: ProjectActivity[]; meta: PaginationMetaDto }> {
    const { page, limit } = options.paginationOptions;
    const query = this.repo.createQueryBuilder('activity');

    if (options.projectId) {
      query.andWhere('activity.projectId = :projectId', { projectId: options.projectId });
    }
    if (options.milestoneId) {
      query.andWhere('activity.milestoneId = :milestoneId', { milestoneId: options.milestoneId });
    }
    if (options.taskId) {
      query.andWhere('activity.taskId = :taskId', { taskId: options.taskId });
    }
    if (options.subtaskId) {
      query.andWhere('activity.subtaskId = :subtaskId', { subtaskId: options.subtaskId });
    }

    const totalItems = await query.getCount();
    const entities = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('activity.createdAt', 'DESC')
      .getMany();

    return {
      items: entities.map(ProjectActivityMapper.toDomain),
      meta: { currentPage: page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
    };
  }
}
