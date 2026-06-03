---
to: src/<%= h.inflection.dasherize(h.inflection.underscore(name)) %>/domain/<%= h.inflection.dasherize(h.inflection.underscore(h.inflection.singularize(name))) %>.ts
---
import { ApiProperty } from '@nestjs/swagger';

export class <%= h.inflection.camelize(h.inflection.singularize(name)) %> {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String, example: '<%= h.inflection.humanize(h.inflection.singularize(name)) %> name' })
  name: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deletedAt?: Date | null;
}
