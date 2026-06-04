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
import { AssignMilestoneDto } from './dto/assign-milestone.dto';
import { BaseQueryDto } from '../common/dto/base-query.dto';
import { AuditLogInterceptor } from '../audit-logs/audit-log.interceptor';
import { AuditLog } from '../audit-logs/audit-log.decorator';
import { createResponse, createPaginatedResponse } from '../common/utils/base-response';
import { extractQueryOptions } from '../common/helpers/query-options.helper';
import { API_PAGE_LIMIT } from '../common/constants/common.constant';
import { MilestonesService } from '../milestones/milestones.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayloadType } from '../auth/strategies/types/jwt-payload.type';

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

  @Get('tasks/:id/timeline')
  @SetMetadata('abilities', [['read', 'tasks']])
  @HttpCode(HttpStatus.OK)
  async getStatusTimeline(@Param('id') id: string) {
    await this.service.findById(id);
    const items = await this.service.getStatusHistory(id);
    return createResponse('Task status timeline fetched successfully', items);
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

  @Get('milestones/:milestoneId/tasks/summary')
  @SetMetadata('abilities', [['read', 'milestones']])
  @HttpCode(HttpStatus.OK)
  async getMilestoneTaskSummary(@Param('milestoneId') milestoneId: string) {
    await this.milestonesService.findById(milestoneId);
    const summary = await this.service.getMilestoneSummary(milestoneId);
    return createResponse('Milestone task summary fetched successfully', summary);
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
    @CurrentUser() currentUser: JwtPayloadType,
  ) {
    const milestone = await this.milestonesService.findById(milestoneId);
    const item = await this.service.createForMilestone(milestoneId, {
      ...dto,
      projectId: milestone.projectId,
    }, currentUser.id);
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
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() currentUser: JwtPayloadType,
  ) {
    const item = await this.service.update(id, dto, currentUser.id);
    return createResponse('Task updated successfully', item);
  }

  @Delete('tasks/:id')
  @SetMetadata('abilities', [['delete', 'tasks']])

  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: JwtPayloadType,
  ): Promise<void> {
    await this.service.remove(id, currentUser.id);
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
  async assignTask(
    @Param('id') id: string,
    @Body() dto: AssignTaskDto,
    @CurrentUser() currentUser: JwtPayloadType,
  ) {
    const item = await this.service.assignTask(id, dto, currentUser.id);
    return createResponse('Task assigned successfully', item);
  }

  @Patch('tasks/:id/milestone')
  @SetMetadata('abilities', [['edit', 'tasks']])
  @HttpCode(HttpStatus.OK)
  async assignToMilestone(
    @Param('id') id: string,
    @Body() dto: AssignMilestoneDto,
    @CurrentUser() currentUser: JwtPayloadType,
  ) {
    const item = await this.service.assignToMilestone(id, dto.milestoneId, currentUser.id);
    return createResponse('Task milestone updated successfully', item);
  }

}
