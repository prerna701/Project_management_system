import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { SubtaskEntity } from '../entities/subtask.entity';
import { SubtasksRepository } from '../../subtasks.repository';
import { Subtask } from '../../../../domain/subtask';
import { SubtaskMapper } from '../mappers/subtask.mapper';
import { IPaginationOptions } from '../../../../../common/types/pagination-options';
import { PaginationMetaDto } from '../../../../../common/dto/pagination-response.dto';
import { TaskStatus } from '../../../../../tasks/enums/task-status.enum';

@Injectable()
export class RelationalSubtasksRepository implements SubtasksRepository {
  constructor(
    @InjectRepository(SubtaskEntity)
    private readonly repo: Repository<SubtaskEntity>,
  ) {}

  async findById(id: string): Promise<Subtask | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? SubtaskMapper.toDomain(entity) : null;
  }

  async findByTaskId(
    taskId: string,
    options: { paginationOptions: IPaginationOptions; search?: string },
  ): Promise<{ items: Subtask[]; meta: PaginationMetaDto }> {
    const { page, limit } = options.paginationOptions;
    const query = this.repo
      .createQueryBuilder('subtask')
      .where('subtask.taskId = :taskId', { taskId })
      .andWhere('subtask.deletedAt IS NULL');

    if (options.search) {
      query.andWhere('subtask.title ILIKE :search', { search: `%${options.search}%` });
    }

    const totalItems = await query.getCount();
    const entities = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('subtask.createdAt', 'ASC')
      .getMany();

    return {
      items: entities.map(SubtaskMapper.toDomain),
      meta: { currentPage: page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
    };
  }

  async findByProject(
    projectId: string,
    options: { paginationOptions: IPaginationOptions; search?: string },
  ): Promise<{ items: Subtask[]; meta: PaginationMetaDto }> {
    const { page, limit } = options.paginationOptions;
    const query = this.repo
      .createQueryBuilder('subtask')
      .where('subtask.projectId = :projectId', { projectId })
      .andWhere('subtask.deletedAt IS NULL');

    if (options.search) {
      query.andWhere('subtask.title ILIKE :search', { search: `%${options.search}%` });
    }

    const totalItems = await query.getCount();
    const entities = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('subtask.createdAt', 'DESC')
      .getMany();

    return {
      items: entities.map(SubtaskMapper.toDomain),
      meta: { currentPage: page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
    };
  }

  async create(item: Partial<Subtask>): Promise<Subtask> {
    const entity = this.repo.create(SubtaskMapper.toPersistence(item) as SubtaskEntity);
    const saved = await this.repo.save(entity);
    return SubtaskMapper.toDomain(saved);
  }

  async update(id: string, item: Partial<Subtask>): Promise<Subtask | null> {
    await this.repo.update(id, SubtaskMapper.toPersistence(item) as any);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }

  async countByTaskId(taskId: string): Promise<{ total: number; completed: number }> {
    const total = await this.repo.count({ where: { taskId, deletedAt: IsNull() } });
    const completed = await this.repo.count({
      where: { taskId, status: TaskStatus.DONE, deletedAt: IsNull() },
    });
    return { total, completed };
  }
}
