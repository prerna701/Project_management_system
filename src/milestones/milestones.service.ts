import { Injectable, NotFoundException } from '@nestjs/common';
import { MilestonesRepository } from './infrastructure/persistence/milestones.repository';
import { Milestone } from './domain/milestone';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { IPaginationOptions } from '../common/types/pagination-options';
import { PaginationMetaDto } from '../common/dto/pagination-response.dto';
import { MilestoneStatus } from './enums/milestone-status.enum';

@Injectable()
export class MilestonesService {
  constructor(private readonly repository: MilestonesRepository) {}

  async findByProjectId(
    projectId: string,
    paginationOptions?: IPaginationOptions,
    search?: string,
  ): Promise<{ items: Milestone[]; meta: PaginationMetaDto }> {
    return this.repository.findByProjectId(projectId, {
      paginationOptions: paginationOptions || { page: 1, limit: 10 },
      search,
    });
  }

  async findById(id: string): Promise<Milestone> {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundException(`Milestone #${id} not found`);
    return item;
  }

  async create(projectId: string, dto: CreateMilestoneDto): Promise<Milestone> {
    return this.repository.create({
      projectId,
      name: dto.name,
      description: dto.description ?? null,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      ownerId: dto.ownerId ?? null,
      status: dto.status ?? MilestoneStatus.PLANNED,
      completionPercentage: dto.completionPercentage ?? 0,
    });
  }

  async update(id: string, dto: UpdateMilestoneDto): Promise<Milestone> {
    const payload: Partial<Milestone> = {
      ...dto,
      dueDate: dto.dueDate !== undefined ? (dto.dueDate ? new Date(dto.dueDate) : null) : undefined,
    };
    const item = await this.repository.update(id, payload);
    if (!item) throw new NotFoundException(`Milestone #${id} not found`);
    return item;
  }

  async remove(id: string): Promise<void> {
    await this.repository.remove(id);
  }
}
