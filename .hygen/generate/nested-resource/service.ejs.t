---
to: src/<%= h.inflection.dasherize(h.inflection.underscore(name)) %>/<%= h.inflection.dasherize(h.inflection.underscore(name)) %>.service.ts
---
import { Injectable, NotFoundException } from '@nestjs/common';
import { <%= h.inflection.camelize(name) %>Repository } from './infrastructure/persistence/<%= h.inflection.dasherize(h.inflection.underscore(name)) %>.repository';
import { <%= h.inflection.camelize(h.inflection.singularize(name)) %> } from './domain/<%= h.inflection.dasherize(h.inflection.underscore(h.inflection.singularize(name))) %>';
import { Create<%= h.inflection.camelize(h.inflection.singularize(name)) %>Dto } from './dto/create-<%= h.inflection.dasherize(h.inflection.underscore(h.inflection.singularize(name))) %>.dto';
import { Update<%= h.inflection.camelize(h.inflection.singularize(name)) %>Dto } from './dto/update-<%= h.inflection.dasherize(h.inflection.underscore(h.inflection.singularize(name))) %>.dto';
import { IPaginationOptions } from '../common/types/pagination-options';
import { PaginationMetaDto } from '../common/dto/pagination-response.dto';

@Injectable()
export class <%= h.inflection.camelize(name) %>Service {
  constructor(private readonly repository: <%= h.inflection.camelize(name) %>Repository) {}

  async findBy<%= h.inflection.camelize(h.inflection.singularize(parent)) %>Id(
    <%= h.inflection.camelize(h.inflection.singularize(parent), true) %>Id: string,
    paginationOptions?: IPaginationOptions,
    search?: string,
  ): Promise<{ items: <%= h.inflection.camelize(h.inflection.singularize(name)) %>[]; meta: PaginationMetaDto }> {
    return this.repository.findBy<%= h.inflection.camelize(h.inflection.singularize(parent)) %>Id(<%= h.inflection.camelize(h.inflection.singularize(parent), true) %>Id, {
      paginationOptions: paginationOptions || { page: 1, limit: 10 },
      search,
    });
  }

  async findById(id: string): Promise<<%= h.inflection.camelize(h.inflection.singularize(name)) %>> {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundException(`<%= h.inflection.camelize(h.inflection.singularize(name)) %> #${id} not found`);
    return item;
  }

  async create(<%= h.inflection.camelize(h.inflection.singularize(parent), true) %>Id: string, dto: Create<%= h.inflection.camelize(h.inflection.singularize(name)) %>Dto): Promise<<%= h.inflection.camelize(h.inflection.singularize(name)) %>> {
    return this.repository.create({ <%= h.inflection.camelize(h.inflection.singularize(parent), true) %>Id, ...dto });
  }

  async update(id: string, dto: Update<%= h.inflection.camelize(h.inflection.singularize(name)) %>Dto): Promise<<%= h.inflection.camelize(h.inflection.singularize(name)) %>> {
    const item = await this.repository.update(id, dto);
    if (!item) throw new NotFoundException(`<%= h.inflection.camelize(h.inflection.singularize(name)) %> #${id} not found`);
    return item;
  }

  async remove(id: string): Promise<void> {
    await this.repository.remove(id);
  }
}
