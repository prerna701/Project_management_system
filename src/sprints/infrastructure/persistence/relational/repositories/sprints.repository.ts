import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SprintEntity } from '../entities/sprint.entity';
import { SprintsRepository } from '../../sprints.repository';
import { Sprint } from '../../../../domain/sprint';
import { SprintMapper } from '../mappers/sprint.mapper';
import { IPaginationOptions } from '../../../../../common/types/pagination-options';
import { PaginationMetaDto } from '../../../../../common/dto/pagination-response.dto';

@Injectable()
export class RelationalSprintsRepository implements SprintsRepository {
  constructor(
    @InjectRepository(SprintEntity)
    private readonly repo: Repository<SprintEntity>,
  ) {}

  async findById(id: string): Promise<Sprint | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? SprintMapper.toDomain(entity) : null;
  }

  async findByProjectId(
    projectId: string,
    options: { paginationOptions: IPaginationOptions; search?: string },
  ): Promise<{ items: Sprint[]; meta: PaginationMetaDto }> {
    const { paginationOptions, search } = options;
    const query = this.repo
      .createQueryBuilder('sprint')
      .where('sprint.projectId = :projectId', { projectId })
      .andWhere('sprint.deletedAt IS NULL');

    if (search) {
      query.andWhere('sprint.name ILIKE :search', { search: `%${search}%` });
    }

    const totalItems = await query.getCount();
    const { page, limit } = paginationOptions;

    const entities = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('sprint.createdAt', 'DESC')
      .getMany();

    return {
      items: entities.map(SprintMapper.toDomain),
      meta: {
        currentPage: page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async create(item: Partial<Sprint>): Promise<Sprint> {
    const entity = this.repo.create(SprintMapper.toPersistence(item) as SprintEntity);
    const saved = await this.repo.save(entity);
    return SprintMapper.toDomain(saved);
  }

  async update(id: string, item: Partial<Sprint>): Promise<Sprint | null> {
    await this.repo.update(id, SprintMapper.toPersistence(item) as any);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
