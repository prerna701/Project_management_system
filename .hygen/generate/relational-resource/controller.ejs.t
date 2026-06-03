---
to: src/<%= h.inflection.dasherize(h.inflection.underscore(name)) %>/<%= h.inflection.dasherize(h.inflection.underscore(name)) %>.controller.ts
---
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  SetMetadata,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { <%= h.inflection.camelize(name) %>Service } from './<%= h.inflection.dasherize(h.inflection.underscore(name)) %>.service';
import { Create<%= h.inflection.camelize(h.inflection.singularize(name)) %>Dto } from './dto/create-<%= h.inflection.dasherize(h.inflection.underscore(h.inflection.singularize(name))) %>.dto';
import { Update<%= h.inflection.camelize(h.inflection.singularize(name)) %>Dto } from './dto/update-<%= h.inflection.dasherize(h.inflection.underscore(h.inflection.singularize(name))) %>.dto';
import { BaseQueryDto } from '../common/dto/base-query.dto';
import { CaslAbilityGuard } from '../auth/guards/casl-ability.guard';
import { AuditLogInterceptor } from '../audit-logs/audit-log.interceptor';
import { AuditLog } from '../audit-logs/audit-log.decorator';
import { createResponse, createPaginatedResponse } from '../common/utils/base-response';
import { extractQueryOptions } from '../common/helpers/query-options.helper';
import { API_PAGE_LIMIT } from '../common/constants/common.constant';

@UseInterceptors(AuditLogInterceptor)
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('<%= h.inflection.humanize(name) %>')
@Controller({ path: '<%= h.inflection.dasherize(h.inflection.underscore(name)) %>', version: '1' })
export class <%= h.inflection.camelize(name) %>Controller {
  constructor(private readonly service: <%= h.inflection.camelize(name) %>Service) {}

  @Get()
  @SetMetadata('abilities', [['browse', '<%= h.inflection.underscore(name) %>']])
  @UseGuards(CaslAbilityGuard)
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: BaseQueryDto) {
    const { paginationOptions } = extractQueryOptions(query, API_PAGE_LIMIT);
    const { items, meta } = await this.service.findAll(paginationOptions, query.search);
    return createPaginatedResponse('<%= h.inflection.humanize(name) %> fetched successfully', items, meta);
  }

  @Get(':id')
  @SetMetadata('abilities', [['read', '<%= h.inflection.underscore(name) %>']])
  @UseGuards(CaslAbilityGuard)
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    const item = await this.service.findById(id);
    return createResponse('<%= h.inflection.humanize(h.inflection.singularize(name)) %> fetched successfully', item);
  }

  @AuditLog({
    module: '<%= h.inflection.humanize(name) %>',
    entityName: '{entityName}',
    descriptionTemplate: 'Created <%= h.inflection.humanize(h.inflection.singularize(name)) %> "{entityName}"',
    impact: 'medium',
  })
  @Post()
  @SetMetadata('abilities', [['add', '<%= h.inflection.underscore(name) %>']])
  @UseGuards(CaslAbilityGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: Create<%= h.inflection.camelize(h.inflection.singularize(name)) %>Dto) {
    const item = await this.service.create(dto);
    return createResponse('<%= h.inflection.humanize(h.inflection.singularize(name)) %> created successfully', item);
  }

  @AuditLog({
    module: '<%= h.inflection.humanize(name) %>',
    entityName: '{entityName}',
    descriptionTemplate: 'Updated <%= h.inflection.humanize(h.inflection.singularize(name)) %> "{entityName}"',
    impact: 'medium',
    trackChanges: true,
  })
  @Patch(':id')
  @SetMetadata('abilities', [['edit', '<%= h.inflection.underscore(name) %>']])
  @UseGuards(CaslAbilityGuard)
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() dto: Update<%= h.inflection.camelize(h.inflection.singularize(name)) %>Dto) {
    const item = await this.service.update(id, dto);
    return createResponse('<%= h.inflection.humanize(h.inflection.singularize(name)) %> updated successfully', item);
  }

  @Delete(':id')
  @SetMetadata('abilities', [['delete', '<%= h.inflection.underscore(name) %>']])
  @UseGuards(CaslAbilityGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.service.remove(id);
  }
}
