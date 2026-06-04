import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProjectActivitiesService } from './project-activities.service';
import { BaseQueryDto } from '../common/dto/base-query.dto';
import { createPaginatedResponse } from '../common/utils/base-response';
import { extractQueryOptions } from '../common/helpers/query-options.helper';
import { API_PAGE_LIMIT } from '../common/constants/common.constant';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Project Activities')
@Controller({ version: '1' })
export class ProjectActivitiesController {
  constructor(private readonly service: ProjectActivitiesService) {}

  @Get('activities')
  @SetMetadata('abilities', [['browse', 'project_activities']])
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: BaseQueryDto) {
    const { paginationOptions } = extractQueryOptions(query, API_PAGE_LIMIT);
    const { items, meta } = await this.service.findAll(paginationOptions);
    return createPaginatedResponse('Activities fetched successfully', items, meta);
  }

  @Get('projects/:projectId/activities')
  @SetMetadata('abilities', [['browse', 'project_activities']])
  @HttpCode(HttpStatus.OK)
  async findByProject(
    @Param('projectId') projectId: string,
    @Query() query: BaseQueryDto,
  ) {
    const { paginationOptions } = extractQueryOptions(query, API_PAGE_LIMIT);
    const { items, meta } = await this.service.findByProject(projectId, paginationOptions);
    return createPaginatedResponse('Activities fetched successfully', items, meta);
  }

  @Get('milestones/:milestoneId/activities')
  @SetMetadata('abilities', [['browse', 'project_activities']])
  @HttpCode(HttpStatus.OK)
  async findByMilestone(
    @Param('milestoneId') milestoneId: string,
    @Query() query: BaseQueryDto,
  ) {
    const { paginationOptions } = extractQueryOptions(query, API_PAGE_LIMIT);
    const { items, meta } = await this.service.findByMilestone(milestoneId, paginationOptions);
    return createPaginatedResponse('Milestone activities fetched successfully', items, meta);
  }

  @Get('tasks/:taskId/activities')
  @SetMetadata('abilities', [['browse', 'project_activities']])
  @HttpCode(HttpStatus.OK)
  async findByTask(
    @Param('taskId') taskId: string,
    @Query() query: BaseQueryDto,
  ) {
    const { paginationOptions } = extractQueryOptions(query, API_PAGE_LIMIT);
    const { items, meta } = await this.service.findByTask(taskId, paginationOptions);
    return createPaginatedResponse('Task activities fetched successfully', items, meta);
  }

  @Get('subtasks/:subtaskId/activities')
  @SetMetadata('abilities', [['browse', 'project_activities']])
  @HttpCode(HttpStatus.OK)
  async findBySubtask(
    @Param('subtaskId') subtaskId: string,
    @Query() query: BaseQueryDto,
  ) {
    const { paginationOptions } = extractQueryOptions(query, API_PAGE_LIMIT);
    const { items, meta } = await this.service.findBySubtask(subtaskId, paginationOptions);
    return createPaginatedResponse('Subtask activities fetched successfully', items, meta);
  }
}
