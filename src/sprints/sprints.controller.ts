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
import { SprintsService } from './sprints.service';
import { CreateSprintDto } from './dto/create-sprint.dto';
import { UpdateSprintDto } from './dto/update-sprint.dto';
import { BaseQueryDto } from '../common/dto/base-query.dto';
import { AuditLogInterceptor } from '../audit-logs/audit-log.interceptor';
import { AuditLog } from '../audit-logs/audit-log.decorator';
import { createResponse, createPaginatedResponse } from '../common/utils/base-response';
import { extractQueryOptions } from '../common/helpers/query-options.helper';
import { API_PAGE_LIMIT } from '../common/constants/common.constant';

@UseInterceptors(AuditLogInterceptor)
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Sprints')
@Controller({ version: '1' })
export class SprintsController {
  constructor(private readonly service: SprintsService) {}

  @Get('projects/:projectId/sprints')
  @SetMetadata('abilities', [['browse', 'sprints']])
  @HttpCode(HttpStatus.OK)
  async findByProject(
    @Param('projectId') projectId: string,
    @Query() query: BaseQueryDto,
  ) {
    const { paginationOptions } = extractQueryOptions(query, API_PAGE_LIMIT);
    const { items, meta } = await this.service.findByProjectId(
      projectId,
      paginationOptions,
      query.search,
    );
    return createPaginatedResponse('Sprints fetched successfully', items, meta);
  }

  @Get('sprints/:id')
  @SetMetadata('abilities', [['read', 'sprints']])
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    const item = await this.service.findById(id);
    return createResponse('Sprint fetched successfully', item);
  }

  @AuditLog({
    module: 'Sprints',
    entityName: '{entityName}',
    descriptionTemplate: 'Created Sprint "{entityName}"',
    impact: 'medium',
  })
  @Post('projects/:projectId/sprints')
  @SetMetadata('abilities', [['add', 'sprints']])
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateSprintDto,
  ) {
    const item = await this.service.create(projectId, dto);
    return createResponse('Sprint created successfully', item);
  }

  @AuditLog({
    module: 'Sprints',
    entityName: '{entityName}',
    descriptionTemplate: 'Updated Sprint "{entityName}"',
    impact: 'medium',
    trackChanges: true,
  })
  @Patch('sprints/:id')
  @SetMetadata('abilities', [['edit', 'sprints']])
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() dto: UpdateSprintDto) {
    const item = await this.service.update(id, dto);
    return createResponse('Sprint updated successfully', item);
  }

  @Delete('sprints/:id')
  @SetMetadata('abilities', [['delete', 'sprints']])
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.service.remove(id);
  }
}
