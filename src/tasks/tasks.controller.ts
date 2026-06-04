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
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { BaseQueryDto } from '../common/dto/base-query.dto';
import { AuditLogInterceptor } from '../audit-logs/audit-log.interceptor';
import { AuditLog } from '../audit-logs/audit-log.decorator';
import { createResponse, createPaginatedResponse } from '../common/utils/base-response';
import { extractQueryOptions } from '../common/helpers/query-options.helper';
import { API_PAGE_LIMIT } from '../common/constants/common.constant';
import { MilestonesService } from '../milestones/milestones.service';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

class CreateTaskWithProjectDto extends CreateTaskDto {
  @ApiProperty({ example: 'project-uuid' })
  @IsNotEmpty()
  @IsUUID()
  projectId: string;
}

@UseInterceptors(AuditLogInterceptor)
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Tasks')
@Controller({ version: '1' })
export class TasksController {
  constructor(
    private readonly service: TasksService,
    private readonly milestonesService: MilestonesService,
  ) {}

  @Get('tasks')
  @SetMetadata('abilities', [['browse', 'tasks']])

  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: BaseQueryDto) {
    const { paginationOptions } = extractQueryOptions(query, API_PAGE_LIMIT);
    const { items, meta } = await this.service.findAll(paginationOptions, query.search);
    return createPaginatedResponse('Tasks fetched successfully', items, meta);
  }

  @Get('tasks/:id')
  @SetMetadata('abilities', [['read', 'tasks']])

  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    const item = await this.service.findById(id);
    return createResponse('Task fetched successfully', item);
  }

  @Get('tasks/:id/subtasks')
  @SetMetadata('abilities', [['browse', 'subtasks']])

  @HttpCode(HttpStatus.OK)
  async findSubtasks(@Param('id') id: string, @Query() query: BaseQueryDto) {
    const { paginationOptions } = extractQueryOptions(query, API_PAGE_LIMIT);
    const { items, meta } = await this.service.findSubtasks(id, paginationOptions);
    return createPaginatedResponse('Subtasks fetched successfully', items, meta);
  }

  @Get('milestones/:milestoneId/tasks')
  @SetMetadata('abilities', [['browse', 'tasks']])
  @HttpCode(HttpStatus.OK)
  async findByMilestone(
    @Param('milestoneId') milestoneId: string,
    @Query() query: BaseQueryDto,
  ) {
    await this.milestonesService.findById(milestoneId);
    const { paginationOptions } = extractQueryOptions(query, API_PAGE_LIMIT);
    const { items, meta } = await this.service.findByMilestone(
      milestoneId,
      paginationOptions,
      query.search,
    );
    return createPaginatedResponse('Milestone tasks fetched successfully', items, meta);
  }

  @AuditLog({
    module: 'Tasks',
    entityName: '{entityName}',
    descriptionTemplate: 'Created Task "{entityName}"',
    impact: 'medium',
  })
  @Post('milestones/:milestoneId/tasks')
  @SetMetadata('abilities', [['add', 'tasks']])

  @HttpCode(HttpStatus.CREATED)
  async createForMilestone(
    @Param('milestoneId') milestoneId: string,
    @Body() dto: CreateTaskDto,
  ) {
    const milestone = await this.milestonesService.findById(milestoneId);
    const item = await this.service.createForMilestone(milestoneId, {
      ...dto,
      projectId: milestone.projectId,
    });
    return createResponse('Task created successfully', item);
  }

  @AuditLog({
    module: 'Tasks',
    entityName: '{entityName}',
    descriptionTemplate: 'Updated Task "{entityName}"',
    impact: 'medium',
    trackChanges: true,
  })
  @Patch('tasks/:id')
  @SetMetadata('abilities', [['edit', 'tasks']])

  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    const item = await this.service.update(id, dto);
    return createResponse('Task updated successfully', item);
  }

  @Delete('tasks/:id')
  @SetMetadata('abilities', [['delete', 'tasks']])

  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.service.remove(id);
  }

  @AuditLog({
    module: 'Tasks',
    entityName: '{entityName}',
    descriptionTemplate: 'Assigned Task "{entityName}" to user',
    impact: 'low',
  })
  @Patch('tasks/:id/assignee')
  @SetMetadata('abilities', [['assign', 'tasks']])

  @HttpCode(HttpStatus.OK)
  async assignTask(@Param('id') id: string, @Body() dto: AssignTaskDto) {
    const item = await this.service.assignTask(id, dto);
    return createResponse('Task assigned successfully', item);
  }

  @AuditLog({
    module: 'Tasks',
    entityName: '{entityName}',
    descriptionTemplate: 'Created Subtask under Task "{entityName}"',
    impact: 'low',
  })
  @Post('tasks/:id/subtasks')
  @SetMetadata('abilities', [['add', 'subtasks']])

  @HttpCode(HttpStatus.CREATED)
  async createSubtask(@Param('id') id: string, @Body() dto: CreateSubtaskDto) {
    const item = await this.service.createSubtask(id, dto);
    return createResponse('Subtask created successfully', item);
  }
}
