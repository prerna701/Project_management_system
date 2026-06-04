import { Injectable, NotFoundException } from '@nestjs/common';
import { ReleaseNotesRepository } from './infrastructure/persistence/release-notes.repository';
import { ReleaseNote } from './domain/release-note';
import { CreateReleaseNoteDto } from './dto/create-release-note.dto';
import { IPaginationOptions } from '../common/types/pagination-options';
import { PaginationMetaDto } from '../common/dto/pagination-response.dto';

@Injectable()
export class ReleaseNotesService {
  constructor(private readonly repository: ReleaseNotesRepository) {}

  async create(projectId: string, dto: CreateReleaseNoteDto, createdBy: string): Promise<ReleaseNote> {
    return this.repository.create({
      projectId,
      title: dto.title,
      version: dto.version,
      description: dto.description ?? null,
      items: dto.items ?? [],
      releasedAt: dto.releasedAt ? new Date(dto.releasedAt) : null,
      createdBy,
    });
  }

  async findByProject(
    projectId: string,
    paginationOptions?: IPaginationOptions,
  ): Promise<{ items: ReleaseNote[]; meta: PaginationMetaDto }> {
    return this.repository.findByProject(projectId, {
      paginationOptions: paginationOptions || { page: 1, limit: 10 },
    });
  }

  async findById(id: string): Promise<ReleaseNote> {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundException(`Release note #${id} not found`);
    return item;
  }
}
