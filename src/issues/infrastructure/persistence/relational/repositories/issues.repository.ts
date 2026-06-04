import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IssueEntity } from '../entities/issue.entity';
import { IssuesRepository } from '../../issues.repository';
import { Issue } from '../../../../domain/issue';
import { IssueMapper } from '../mappers/issue.mapper';
import { IPaginationOptions } from '../../../../../common/types/pagination-options';
import { PaginationMetaDto } from '../../../../../common/dto/pagination-response.dto';

@Injectable()
export class RelationalIssuesRepository implements IssuesRepository {
  constructor(
    @InjectRepository(IssueEntity)
    private readonly repo: Repository<IssueEntity>,
  ) {}

  async findById(id: string): Promise<Issue | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? IssueMapper.toDomain(entity) : null;
  }

  async findByProject(
    projectId: string,
    options: { paginationOptions: IPaginationOptions; search?: string },
  ): Promise<{ items: Issue[]; meta: PaginationMetaDto }> {
    const { paginationOptions, search } = options;
    const { page, limit } = paginationOptions;

    const query = this.repo
      .createQueryBuilder('issue')
      .where('issue.projectId = :projectId', { projectId });

    if (search) {
      query.andWhere('issue.title ILIKE :search', { search: `%${search}%` });
    }

    const totalItems = await query.getCount();
    const entities = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('issue.createdAt', 'DESC')
      .getMany();

    return {
      items: entities.map(IssueMapper.toDomain),
      meta: { currentPage: page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
    };
  }

  async create(item: Partial<Issue>): Promise<Issue> {
    const entity = this.repo.create(IssueMapper.toPersistence(item) as IssueEntity);
    const saved = await this.repo.save(entity);
    return IssueMapper.toDomain(saved);
  }

  async update(id: string, item: Partial<Issue>): Promise<Issue | null> {
    await this.repo.update(id, IssueMapper.toPersistence(item) as any);
    return this.findById(id);
  }
}
