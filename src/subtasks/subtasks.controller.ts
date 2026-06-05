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
import { SubtasksService } from './subtasks.service';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { AssignSubtaskDto } from './dto/assign-subtask.dto';
import { BaseQueryDto } from '../common/dto/base-query.dto';
import { AuditLogInterceptor } from '../audit-logs/audit-log.interceptor';
import { AuditLog } from '../audit-logs/audit-log.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayloadType } from '../auth/strategies/types/jwt-payload.type';
import { createResponse, createPaginatedResponse } from '../common/utils/base-response';
import { extractQueryOptions } from '../common/helpers/query-options.helper';
import { API_PAGE_LIMIT } from '../common/constants/common.constant';
import { TasksService } from '../tasks/tasks.service';

@UseInterceptors(AuditLogInterceptor)
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Subtasks')
@Controller({ version: '1' })
export class SubtasksController {
  constructor(
    private readonly service: SubtasksService,
    private readonly tasksService: TasksService,
  ) {}

  @Get('tasks/:taskId/subtasks')
  @SetMetadata('abilities', [['browse', 'subtasks']])
  @HttpCode(HttpStatus.OK)
  async findByTask(
    @Param('taskId') taskId: string,
    @Query() query: BaseQueryDto,
  ) {
    await this.tasksService.findById(taskId);
    const { paginationOptions } = extractQueryOptions(query, API_PAGE_LIMIT);
    const { items, meta } = await this.service.findByTask(taskId, paginationOptions, query.search);
    return createPaginatedResponse('Subtasks fetched successfully', items, meta);
  }

  @Get('subtasks/:id')
  @SetMetadata('abilities', [['read', 'subtasks']])
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    const item = await this.service.findById(id);
    return createResponse('Subtask fetched successfully', item);
  }

  @AuditLog({
    module: 'Subtasks',
    entityName: '{entityName}',
    descriptionTemplate: 'Created Subtask "{entityName}" under task',
    impact: 'low',
  })
  @Post('tasks/:taskId/subtasks')
  @SetMetadata('abilities', [['add', 'subtasks']])
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('taskId') taskId: string,
    @Body() dto: CreateSubtaskDto,
    @CurrentUser() currentUser: JwtPayloadType,
  ) {
    const task = await this.tasksService.findById(taskId);
    const item = await this.service.create(taskId, task.projectId, dto, currentUser.id, task.ownerId ?? null);
    return createResponse('Subtask created successfully', item);
  }

  @AuditLog({
    module: 'Subtasks',
    entityName: '{entityName}',
    descriptionTemplate: 'Updated Subtask "{entityName}"',
    impact: 'low',
    trackChanges: true,
  })
  @Patch('subtasks/:id')
  @SetMetadata('abilities', [['edit', 'subtasks']])
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSubtaskDto,
    @CurrentUser() currentUser: JwtPayloadType,
  ) {
    const item = await this.service.update(id, dto, currentUser.id);
    return createResponse('Subtask updated successfully', item);
  }

  @Patch('subtasks/:id/assignee')
  @SetMetadata('abilities', [['assign', 'subtasks']])
  @HttpCode(HttpStatus.OK)
  async assignSubtask(
    @Param('id') id: string,
    @Body() dto: AssignSubtaskDto,
    @CurrentUser() currentUser: JwtPayloadType,
  ) {
    const item = await this.service.assignSubtask(id, dto, currentUser.id);
    return createResponse('Subtask assigned successfully', item);
  }

  @Delete('subtasks/:id')
  @SetMetadata('abilities', [['delete', 'subtasks']])
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: JwtPayloadType,
  ): Promise<void> {
    await this.service.remove(id, currentUser.id);
  }
}
