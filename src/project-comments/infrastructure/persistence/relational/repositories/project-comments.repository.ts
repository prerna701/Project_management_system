import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectCommentEntity } from '../entities/project-comment.entity';
import { ProjectCommentsRepository } from '../../project-comments.repository';
import { ProjectComment } from '../../../../domain/project-comment';
import { ProjectCommentMapper } from '../mappers/project-comment.mapper';
import { IPaginationOptions } from '../../../../../common/types/pagination-options';
import { PaginationMetaDto } from '../../../../../common/dto/pagination-response.dto';

@Injectable()
export class RelationalProjectCommentsRepository implements ProjectCommentsRepository {
  constructor(
    @InjectRepository(ProjectCommentEntity)
    private readonly repo: Repository<ProjectCommentEntity>,
  ) {}

  async findById(id: string): Promise<ProjectComment | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? ProjectCommentMapper.toDomain(entity) : null;
  }

  async findByProjectId(
    projectId: string,
    options: { paginationOptions: IPaginationOptions },
  ): Promise<{ items: ProjectComment[]; meta: PaginationMetaDto }> {
    const { page, limit } = options.paginationOptions;
    const query = this.repo
      .createQueryBuilder('comment')
      .where('comment.projectId = :projectId', { projectId })
      .andWhere('comment.milestoneId IS NULL')
      .andWhere('comment.deletedAt IS NULL');

    const totalItems = await query.getCount();
    const entities = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('comment.createdAt', 'DESC')
      .getMany();

    return {
      items: entities.map(ProjectCommentMapper.toDomain),
      meta: { currentPage: page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
    };
  }

  async findByMilestoneId(
    milestoneId: string,
    options: { paginationOptions: IPaginationOptions },
  ): Promise<{ items: ProjectComment[]; meta: PaginationMetaDto }> {
    const { page, limit } = options.paginationOptions;
    const query = this.repo
      .createQueryBuilder('comment')
      .where('comment.milestoneId = :milestoneId', { milestoneId })
      .andWhere('comment.deletedAt IS NULL');

    const totalItems = await query.getCount();
    const entities = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('comment.createdAt', 'ASC')
      .getMany();

    return {
      items: entities.map(ProjectCommentMapper.toDomain),
      meta: { currentPage: page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
    };
  }

  async create(item: Partial<ProjectComment>): Promise<ProjectComment> {
    const entity = this.repo.create(ProjectCommentMapper.toPersistence(item) as ProjectCommentEntity);
    const saved = await this.repo.save(entity);
    return ProjectCommentMapper.toDomain(saved);
  }

  async update(id: string, item: Partial<ProjectComment>): Promise<ProjectComment | null> {
    await this.repo.update(id, ProjectCommentMapper.toPersistence(item) as any);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
