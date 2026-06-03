---
to: src/<%= h.inflection.dasherize(h.inflection.underscore(name)) %>/infrastructure/persistence/relational/mappers/<%= h.inflection.dasherize(h.inflection.underscore(h.inflection.singularize(name))) %>.mapper.ts
---
import { <%= h.inflection.camelize(h.inflection.singularize(name)) %> } from '../../../../domain/<%= h.inflection.dasherize(h.inflection.underscore(h.inflection.singularize(name))) %>';
import { <%= h.inflection.camelize(h.inflection.singularize(name)) %>Entity } from '../entities/<%= h.inflection.dasherize(h.inflection.underscore(h.inflection.singularize(name))) %>.entity';

export class <%= h.inflection.camelize(h.inflection.singularize(name)) %>Mapper {
  static toDomain(raw: <%= h.inflection.camelize(h.inflection.singularize(name)) %>Entity): <%= h.inflection.camelize(h.inflection.singularize(name)) %> {
    const item = new <%= h.inflection.camelize(h.inflection.singularize(name)) %>();
    item.id = raw.id;
    item.name = raw.name;
    item.createdAt = raw.createdAt;
    item.updatedAt = raw.updatedAt;
    item.deletedAt = raw.deletedAt;
    return item;
  }

  static toPersistence(item: <%= h.inflection.camelize(h.inflection.singularize(name)) %>): <%= h.inflection.camelize(h.inflection.singularize(name)) %>Entity {
    const entity = new <%= h.inflection.camelize(h.inflection.singularize(name)) %>Entity();
    if (item.id) entity.id = item.id;
    entity.name = item.name;
    return entity;
  }
}
