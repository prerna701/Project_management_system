import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ProjectTagEntity } from '../entities/project-tag.entity';
import { ProjectTagRepository } from '../../project-tag.repository';
import { ProjectTag } from '../../../../domain/project-tag';
import { ProjectTagMapper } from '../mappers/project-tag.mapper';

@Injectable()
export class RelationalProjectTagRepository implements ProjectTagRepository {
  constructor(
    @InjectRepository(ProjectTagEntity)
    private readonly repo: Repository<ProjectTagEntity>,
  ) {}

  async findAll(): Promise<ProjectTag[]> {
    const entities = await this.repo.find({ where: { deletedAt: IsNull() } });
    return entities.map(ProjectTagMapper.toDomain);
  }

  async findById(id: string): Promise<ProjectTag | null> {
    const entity = await this.repo.findOne({ where: { id, deletedAt: IsNull() } });
    return entity ? ProjectTagMapper.toDomain(entity) : null;
  }

  async create(item: Partial<ProjectTag>): Promise<ProjectTag> {
    const entity = this.repo.create(ProjectTagMapper.toPersistence(item) as ProjectTagEntity);
    const saved = await this.repo.save(entity);
    return ProjectTagMapper.toDomain(saved);
  }

  async update(id: string, item: Partial<ProjectTag>): Promise<ProjectTag | null> {
    await this.repo.update(id, ProjectTagMapper.toPersistence(item));
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
