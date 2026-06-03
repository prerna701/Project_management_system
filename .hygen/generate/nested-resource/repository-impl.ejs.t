---
to: src/<%= h.inflection.dasherize(h.inflection.underscore(name)) %>/infrastructure/persistence/relational/repositories/<%= h.inflection.dasherize(h.inflection.underscore(name)) %>.repository.ts
---
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { <%= h.inflection.camelize(h.inflection.singularize(name)) %>Entity } from '../entities/<%= h.inflection.dasherize(h.inflection.underscore(h.inflection.singularize(name))) %>.entity';
import { <%= h.inflection.camelize(name) %>Repository } from '../../<%= h.inflection.dasherize(h.inflection.underscore(name)) %>.repository';
import { <%= h.inflection.camelize(h.inflection.singularize(name)) %> } from '../../../../domain/<%= h.inflection.dasherize(h.inflection.underscore(h.inflection.singularize(name))) %>';
import { <%= h.inflection.camelize(h.inflection.singularize(name)) %>Mapper } from '../mappers/<%= h.inflection.dasherize(h.inflection.underscore(h.inflection.singularize(name))) %>.mapper';
import { IPaginationOptions } from '../../../../../common/types/pagination-options';
import { PaginationMetaDto } from '../../../../../common/dto/pagination-response.dto';

@Injectable()
export class Relational<%= h.inflection.camelize(name) %>Repository implements <%= h.inflection.camelize(name) %>Repository {
  constructor(
    @InjectRepository(<%= h.inflection.camelize(h.inflection.singularize(name)) %>Entity)
    private readonly repo: Repository<<%= h.inflection.camelize(h.inflection.singularize(name)) %>Entity>,
  ) {}

  async findById(id: string): Promise<<%= h.inflection.camelize(h.inflection.singularize(name)) %> | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? <%= h.inflection.camelize(h.inflection.singularize(name)) %>Mapper.toDomain(entity) : null;
  }

  async findBy<%= h.inflection.camelize(h.inflection.singularize(parent)) %>Id(
    <%= h.inflection.camelize(h.inflection.singularize(parent), true) %>Id: string,
    options: { paginationOptions: IPaginationOptions; search?: string },
  ): Promise<{ items: <%= h.inflection.camelize(h.inflection.singularize(name)) %>[]; meta: PaginationMetaDto }> {
    const { paginationOptions, search } = options;
    const query = this.repo
      .createQueryBuilder('item')
      .where('item.<%= h.inflection.camelize(h.inflection.singularize(parent), true) %>Id = :<%= h.inflection.camelize(h.inflection.singularize(parent), true) %>Id', { <%= h.inflection.camelize(h.inflection.singularize(parent), true) %>Id })
      .andWhere('item.deletedAt IS NULL');

    if (search) {
      query.andWhere('item.name ILIKE :search', { search: `%${search}%` });
    }

    const totalItems = await query.getCount();
    const { page, limit } = paginationOptions;

    const entities = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('item.createdAt', 'DESC')
      .getMany();

    return {
      items: entities.map(<%= h.inflection.camelize(h.inflection.singularize(name)) %>Mapper.toDomain),
      meta: { currentPage: page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
    };
  }

  async create(item: Partial<<%= h.inflection.camelize(h.inflection.singularize(name)) %>>): Promise<<%= h.inflection.camelize(h.inflection.singularize(name)) %>> {
    const entity = this.repo.create(<%= h.inflection.camelize(h.inflection.singularize(name)) %>Mapper.toPersistence(item) as <%= h.inflection.camelize(h.inflection.singularize(name)) %>Entity);
    const saved = await this.repo.save(entity);
    return <%= h.inflection.camelize(h.inflection.singularize(name)) %>Mapper.toDomain(saved);
  }

  async update(id: string, item: Partial<<%= h.inflection.camelize(h.inflection.singularize(name)) %>>): Promise<<%= h.inflection.camelize(h.inflection.singularize(name)) %> | null> {
    await this.repo.update(id, <%= h.inflection.camelize(h.inflection.singularize(name)) %>Mapper.toPersistence(item) as any);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}
