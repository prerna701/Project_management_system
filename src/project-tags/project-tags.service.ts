import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectTagRepository } from './infrastructure/persistence/project-tag.repository';
import { ProjectTag } from './domain/project-tag';
import { CreateProjectTagDto } from './dto/create-project-tag.dto';
import { UpdateProjectTagDto } from './dto/update-project-tag.dto';

@Injectable()
export class ProjectTagsService {
  constructor(private readonly repository: ProjectTagRepository) {}

  async findAll(): Promise<ProjectTag[]> {
    return this.repository.findAll();
  }

  async findById(id: string): Promise<ProjectTag> {
    const tag = await this.repository.findById(id);
    if (!tag) throw new NotFoundException(`ProjectTag #${id} not found`);
    return tag;
  }

  async create(dto: CreateProjectTagDto): Promise<ProjectTag> {
    return this.repository.create(dto);
  }

  async update(id: string, dto: UpdateProjectTagDto): Promise<ProjectTag> {
    const tag = await this.repository.update(id, dto);
    if (!tag) throw new NotFoundException(`ProjectTag #${id} not found`);
    return tag;
  }

  async remove(id: string): Promise<void> {
    await this.repository.remove(id);
  }
}
