---
to: src/<%= h.inflection.dasherize(h.inflection.underscore(name)) %>/dto/update-<%= h.inflection.dasherize(h.inflection.underscore(h.inflection.singularize(name))) %>.dto.ts
---
import { PartialType } from '@nestjs/swagger';
import { Create<%= h.inflection.camelize(h.inflection.singularize(name)) %>Dto } from './create-<%= h.inflection.dasherize(h.inflection.underscore(h.inflection.singularize(name))) %>.dto';

export class Update<%= h.inflection.camelize(h.inflection.singularize(name)) %>Dto extends PartialType(Create<%= h.inflection.camelize(h.inflection.singularize(name)) %>Dto) {}
