import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReleaseNoteEntity } from '../entities/release-note.entity';
import { ReleaseNotesRepository } from '../../release-notes.repository';
import { ReleaseNote } from '../../../../domain/release-note';
import { ReleaseNoteMapper } from '../mappers/release-note.mapper';
import { IPaginationOptions } from '../../../../../common/types/pagination-options';
import { PaginationMetaDto } from '../../../../../common/dto/pagination-response.dto';

@Injectable()
export class RelationalReleaseNotesRepository implements ReleaseNotesRepository {
  constructor(
    @InjectRepository(ReleaseNoteEntity)
    private readonly repo: Repository<ReleaseNoteEntity>,
  ) {}

  async findById(id: string): Promise<ReleaseNote | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? ReleaseNoteMapper.toDomain(entity) : null;
  }

  async findByProject(
    projectId: string,
    options: { paginationOptions: IPaginationOptions },
  ): Promise<{ items: ReleaseNote[]; meta: PaginationMetaDto }> {
    const { page, limit } = options.paginationOptions;

    const [entities, totalItems] = await this.repo.findAndCount({
      where: { projectId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: entities.map(ReleaseNoteMapper.toDomain),
      meta: { currentPage: page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
    };
  }

  async create(item: Partial<ReleaseNote>): Promise<ReleaseNote> {
    const entity = this.repo.create(ReleaseNoteMapper.toPersistence(item) as ReleaseNoteEntity);
    const saved = await this.repo.save(entity);
    return ReleaseNoteMapper.toDomain(saved);
  }
}
