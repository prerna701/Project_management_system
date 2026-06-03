---
to: src/<%= h.inflection.dasherize(h.inflection.underscore(name)) %>/infrastructure/persistence/relational/mappers/<%= h.inflection.dasherize(h.inflection.underscore(h.inflection.singularize(name))) %>.mapper.ts
---
import { <%= h.inflection.camelize(h.inflection.singularize(name)) %> } from '../../../../domain/<%= h.inflection.dasherize(h.inflection.underscore(h.inflection.singularize(name))) %>';
import { <%= h.inflection.camelize(h.inflection.singularize(name)) %>Entity } from '../entities/<%= h.inflection.dasherize(h.inflection.underscore(h.inflection.singularize(name))) %>.entity';

export class <%= h.inflection.camelize(h.inflection.singularize(name)) %>Mapper {
  static toDomain(raw: <%= h.inflection.camelize(h.inflection.singularize(name)) %>Entity): <%= h.inflection.camelize(h.inflection.singularize(name)) %> {
    const item = new <%= h.inflection.camelize(h.inflection.singularize(name)) %>();
    item.id = raw.id;
    item.<%= h.inflection.camelize(h.inflection.singularize(parent), true) %>Id = raw.<%= h.inflection.camelize(h.inflection.singularize(parent), true) %>Id;
    item.name = raw.name;
    item.description = raw.description;
    item.createdAt = raw.createdAt;
    item.updatedAt = raw.updatedAt;
    item.deletedAt = raw.deletedAt;
    return item;
  }

  static toPersistence(item: Partial<<%= h.inflection.camelize(h.inflection.singularize(name)) %>>): Partial<<%= h.inflection.camelize(h.inflection.singularize(name)) %>Entity> {
    const entity: Partial<<%= h.inflection.camelize(h.inflection.singularize(name)) %>Entity> = {};
    if (item.id) entity.id = item.id;
    if (item.<%= h.inflection.camelize(h.inflection.singularize(parent), true) %>Id !== undefined) entity.<%= h.inflection.camelize(h.inflection.singularize(parent), true) %>Id = item.<%= h.inflection.camelize(h.inflection.singularize(parent), true) %>Id;
    if (item.name !== undefined) entity.name = item.name;
    if (item.description !== undefined) entity.description = item.description ?? null;
    return entity;
  }
}
