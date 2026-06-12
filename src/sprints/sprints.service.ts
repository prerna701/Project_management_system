import { Injectable, NotFoundException } from '@nestjs/common';
import { SprintsRepository } from './infrastructure/persistence/sprints.repository';
import { Sprint } from './domain/sprint';
import { CreateSprintDto } from './dto/create-sprint.dto';
import { UpdateSprintDto } from './dto/update-sprint.dto';
import { IPaginationOptions } from '../common/types/pagination-options';
import { PaginationMetaDto } from '../common/dto/pagination-response.dto';
import { SprintStatus } from './enums/sprint-status.enum';

@Injectable()
export class SprintsService {
  constructor(private readonly repository: SprintsRepository) {}

  async findByProjectId(
    projectId: string,
    paginationOptions?: IPaginationOptions,
    search?: string,
  ): Promise<{ items: Sprint[]; meta: PaginationMetaDto }> {
    return this.repository.findByProjectId(projectId, {
      paginationOptions: paginationOptions ?? { page: 1, limit: 50 },
      search,
    });
  }

  async findById(id: string): Promise<Sprint> {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundException(`Sprint #${id} not found`);
    return item;
  }

  async create(projectId: string, dto: CreateSprintDto): Promise<Sprint> {
    return this.repository.create({
      projectId,
      name: dto.name,
      goal: dto.goal ?? null,
      status: dto.status ?? SprintStatus.PLANNED,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      endDate: dto.endDate ? new Date(dto.endDate) : null,
    });
  }

  async update(id: string, dto: UpdateSprintDto): Promise<Sprint> {
    const payload: Partial<Sprint> = {
      ...dto,
      startDate:
        dto.startDate !== undefined
          ? dto.startDate
            ? new Date(dto.startDate)
            : null
          : undefined,
      endDate:
        dto.endDate !== undefined
          ? dto.endDate
            ? new Date(dto.endDate)
            : null
          : undefined,
    };
    const item = await this.repository.update(id, payload);
    if (!item) throw new NotFoundException(`Sprint #${id} not found`);
    return item;
  }

  async remove(id: string): Promise<void> {
    await this.repository.remove(id);
  }
}
