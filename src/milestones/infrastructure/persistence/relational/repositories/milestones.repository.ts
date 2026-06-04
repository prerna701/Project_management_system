import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MilestoneEntity } from '../entities/milestone.entity';
import { MilestoneStatusHistoryEntity } from '../entities/milestone-status-history.entity';
import { MilestonesRepository, MilestoneStatusHistoryEntry } from '../../milestones.repository';
import { Milestone } from '../../../../domain/milestone';
import { MilestoneMapper } from '../mappers/milestone.mapper';
import { IPaginationOptions } from '../../../../../common/types/pagination-options';
import { PaginationMetaDto } from '../../../../../common/dto/pagination-response.dto';

@Injectable()
export class RelationalMilestonesRepository implements MilestonesRepository {
  constructor(
    @InjectRepository(MilestoneEntity)
    private readonly repo: Repository<MilestoneEntity>,
    @InjectRepository(MilestoneStatusHistoryEntity)
    private readonly statusHistoryRepo: Repository<MilestoneStatusHistoryEntity>,
  ) {}

  async findById(id: string): Promise<Milestone | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? MilestoneMapper.toDomain(entity) : null;
  }

  async findByProjectId(
    projectId: string,
    options: { paginationOptions: IPaginationOptions; search?: string },
  ): Promise<{ items: Milestone[]; meta: PaginationMetaDto }> {
    const { paginationOptions, search } = options;
    const query = this.repo
      .createQueryBuilder('milestone')
      .where('milestone.projectId = :projectId', { projectId })
      .andWhere('milestone.deletedAt IS NULL');

    if (search) {
      query.andWhere('milestone.name ILIKE :search', { search: `%${search}%` });
    }

    const totalItems = await query.getCount();
    const { page, limit } = paginationOptions;

    const entities = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('milestone.createdAt', 'DESC')
      .getMany();

    return {
      items: entities.map(MilestoneMapper.toDomain),
      meta: { currentPage: page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
    };
  }

  async create(item: Partial<Milestone>): Promise<Milestone> {
    const entity = this.repo.create(MilestoneMapper.toPersistence(item) as MilestoneEntity);
    const saved = await this.repo.save(entity);
    return MilestoneMapper.toDomain(saved);
  }

  async update(id: string, item: Partial<Milestone>): Promise<Milestone | null> {
    await this.repo.update(id, MilestoneMapper.toPersistence(item) as any);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }

  async recordStatusChange(
    entry: Omit<MilestoneStatusHistoryEntry, 'id' | 'createdAt'>,
  ): Promise<MilestoneStatusHistoryEntry> {
    const saved = await this.statusHistoryRepo.save(
      this.statusHistoryRepo.create({
        milestoneId: entry.milestoneId,
        fromStatus: entry.fromStatus,
        toStatus: entry.toStatus,
        changedBy: entry.changedBy,
        note: entry.note ?? null,
      }),
    );
    return {
      id: saved.id,
      milestoneId: saved.milestoneId,
      fromStatus: saved.fromStatus,
      toStatus: saved.toStatus,
      changedBy: saved.changedBy,
      note: saved.note,
      createdAt: saved.createdAt,
    };
  }

  async findStatusHistory(milestoneId: string): Promise<MilestoneStatusHistoryEntry[]> {
    const rows = await this.statusHistoryRepo.find({
      where: { milestoneId },
      order: { createdAt: 'DESC' },
    });
    return rows.map((r) => ({
      id: r.id,
      milestoneId: r.milestoneId,
      fromStatus: r.fromStatus,
      toStatus: r.toStatus,
      changedBy: r.changedBy,
      note: r.note,
      createdAt: r.createdAt,
    }));
  }
}
