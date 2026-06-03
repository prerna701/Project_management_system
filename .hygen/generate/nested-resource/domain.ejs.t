---
to: src/<%= h.inflection.dasherize(h.inflection.underscore(name)) %>/domain/<%= h.inflection.dasherize(h.inflection.underscore(h.inflection.singularize(name))) %>.ts
---
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class <%= h.inflection.camelize(h.inflection.singularize(name)) %> {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  <%= h.inflection.camelize(h.inflection.singularize(parent), true) %>Id: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiPropertyOptional()
  description: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  deletedAt: Date | null;
}
