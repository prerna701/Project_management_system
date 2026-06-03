---
to: src/<%= h.inflection.dasherize(h.inflection.underscore(name)) %>/infrastructure/persistence/<%= h.inflection.dasherize(h.inflection.underscore(name)) %>.repository.ts
---
import { <%= h.inflection.camelize(h.inflection.singularize(name)) %> } from '../../domain/<%= h.inflection.dasherize(h.inflection.underscore(h.inflection.singularize(name))) %>';
import { IPaginationOptions } from '../../../common/types/pagination-options';
import { PaginationMetaDto } from '../../../common/dto/pagination-response.dto';

export abstract class <%= h.inflection.camelize(name) %>Repository {
  abstract findById(id: string): Promise<<%= h.inflection.camelize(h.inflection.singularize(name)) %> | null>;
  abstract findBy<%= h.inflection.camelize(h.inflection.singularize(parent)) %>Id(
    <%= h.inflection.camelize(h.inflection.singularize(parent), true) %>Id: string,
    options: { paginationOptions: IPaginationOptions; search?: string },
  ): Promise<{ items: <%= h.inflection.camelize(h.inflection.singularize(name)) %>[]; meta: PaginationMetaDto }>;
  abstract create(item: Partial<<%= h.inflection.camelize(h.inflection.singularize(name)) %>>): Promise<<%= h.inflection.camelize(h.inflection.singularize(name)) %>>;
  abstract update(id: string, item: Partial<<%= h.inflection.camelize(h.inflection.singularize(name)) %>>): Promise<<%= h.inflection.camelize(h.inflection.singularize(name)) %> | null>;
  abstract remove(id: string): Promise<void>;
}
