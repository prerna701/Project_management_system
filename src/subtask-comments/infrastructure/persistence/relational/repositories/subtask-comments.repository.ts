import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubtaskCommentEntity } from '../entities/subtask-comment.entity';
import { SubtaskCommentsRepository } from '../../subtask-comments.repository';
import { SubtaskComment } from '../../../../domain/subtask-comment';
import { SubtaskCommentMapper } from '../mappers/subtask-comment.mapper';
import { IPaginationOptions } from '../../../../../common/types/pagination-options';
import { PaginationMetaDto } from '../../../../../common/dto/pagination-response.dto';

@Injectable()
export class RelationalSubtaskCommentsRepository implements SubtaskCommentsRepository {
  constructor(
    @InjectRepository(SubtaskCommentEntity)
    private readonly repo: Repository<SubtaskCommentEntity>,
  ) {}

  async findById(id: string): Promise<SubtaskComment | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? SubtaskCommentMapper.toDomain(entity) : null;
  }

  async findBySubtaskId(
    subtaskId: string,
    options: { paginationOptions: IPaginationOptions },
  ): Promise<{ items: SubtaskComment[]; meta: PaginationMetaDto }> {
    const { page, limit } = options.paginationOptions;
    const query = this.repo
      .createQueryBuilder('comment')
      .where('comment.subtaskId = :subtaskId', { subtaskId })
      .andWhere('comment.deletedAt IS NULL');

    const totalItems = await query.getCount();
    const entities = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('comment.createdAt', 'ASC')
      .getMany();

    return {
      items: entities.map(SubtaskCommentMapper.toDomain),
      meta: { currentPage: page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
    };
  }

  async create(item: Partial<SubtaskComment>): Promise<SubtaskComment> {
    const entity = this.repo.create(SubtaskCommentMapper.toPersistence(item) as SubtaskCommentEntity);
    const saved = await this.repo.save(entity);
    return SubtaskCommentMapper.toDomain(saved);
  }

  async update(id: string, item: Partial<SubtaskComment>): Promise<SubtaskComment | null> {
    await this.repo.update(id, SubtaskCommentMapper.toPersistence(item) as any);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
