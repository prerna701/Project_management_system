import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CommentEntity } from '../entities/comment.entity';
import { CommentsRepository } from '../../comments.repository';
import { Comment } from '../../../../domain/comment';
import { CommentMapper } from '../mappers/comment.mapper';
import { CommentableEntity } from '../../../../enums/commentable-entity.enum';
import { IPaginationOptions } from '../../../../../common/types/pagination-options';
import { PaginationMetaDto } from '../../../../../common/dto/pagination-response.dto';

@Injectable()
export class RelationalCommentsRepository implements CommentsRepository {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly repo: Repository<CommentEntity>,
  ) {}

  async findById(id: string): Promise<Comment | null> {
    const entity = await this.repo.findOne({ where: { id, deletedAt: IsNull() } });
    return entity ? CommentMapper.toDomain(entity) : null;
  }

  async findByEntity(options: {
    entityType: CommentableEntity;
    entityId: string;
    paginationOptions: IPaginationOptions;
    parentId?: string | null;
  }): Promise<{ items: Comment[]; meta: PaginationMetaDto }> {
    const { entityType, entityId, paginationOptions, parentId } = options;
    const { page, limit } = paginationOptions;

    const query = this.repo
      .createQueryBuilder('comment')
      .where('comment.entityType = :entityType', { entityType })
      .andWhere('comment.entityId = :entityId', { entityId })
      .andWhere('comment.deletedAt IS NULL');

    if (parentId === null) {
      query.andWhere('comment.parentId IS NULL');
    } else if (parentId !== undefined) {
      query.andWhere('comment.parentId = :parentId', { parentId });
    }

    const totalItems = await query.getCount();

    const entities = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('comment.createdAt', 'ASC')
      .getMany();

    return {
      items: entities.map(CommentMapper.toDomain),
      meta: {
        currentPage: page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async create(item: Partial<Comment>): Promise<Comment> {
    const entity = this.repo.create(CommentMapper.toPersistence(item) as CommentEntity);
    const saved = await this.repo.save(entity);
    return CommentMapper.toDomain(saved);
  }

  async update(id: string, item: Partial<Comment>): Promise<Comment | null> {
    await this.repo.update(id, CommentMapper.toPersistence(item) as any);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
