import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvitationTemplateEntity } from '../entities/invitation-template.entity';
import { InvitationTemplatesRepository } from '../../invitation-templates.repository';
import { InvitationTemplate } from '../../../../domain/invitation-template';
import { InvitationTemplateMapper } from '../mappers/invitation-template.mapper';
import { IPaginationOptions } from '../../../../../common/types/pagination-options';
import { PaginationMetaDto } from '../../../../../common/dto/pagination-response.dto';

@Injectable()
export class RelationalInvitationTemplatesRepository implements InvitationTemplatesRepository {
  constructor(
    @InjectRepository(InvitationTemplateEntity)
    private readonly repo: Repository<InvitationTemplateEntity>,
  ) {}

  async findById(id: string): Promise<InvitationTemplate | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? InvitationTemplateMapper.toDomain(entity) : null;
  }

  async findAll(options: {
    paginationOptions: IPaginationOptions;
  }): Promise<{ items: InvitationTemplate[]; meta: PaginationMetaDto }> {
    const { page, limit } = options.paginationOptions;
    const query = this.repo.createQueryBuilder('t').where('t.deletedAt IS NULL');
    const totalItems = await query.getCount();
    const entities = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('t.createdAt', 'DESC')
      .getMany();

    return {
      items: entities.map(InvitationTemplateMapper.toDomain),
      meta: { currentPage: page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
    };
  }

  async create(item: Partial<InvitationTemplate>): Promise<InvitationTemplate> {
    const entity = this.repo.create(InvitationTemplateMapper.toPersistence(item) as InvitationTemplateEntity);
    const saved = await this.repo.save(entity);
    return InvitationTemplateMapper.toDomain(saved);
  }

  async update(id: string, item: Partial<InvitationTemplate>): Promise<InvitationTemplate | null> {
    await this.repo.update(id, InvitationTemplateMapper.toPersistence(item) as any);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
