---
to: src/<%= h.inflection.dasherize(h.inflection.underscore(name)) %>/dto/create-<%= h.inflection.dasherize(h.inflection.underscore(h.inflection.singularize(name))) %>.dto.ts
---
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class Create<%= h.inflection.camelize(h.inflection.singularize(name)) %>Dto {
  @ApiProperty({ example: '<%= h.inflection.humanize(h.inflection.singularize(name)) %> name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
