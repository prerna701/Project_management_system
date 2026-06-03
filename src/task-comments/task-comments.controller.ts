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
import { TaskCommentsService } from './task-comments.service';
import { CreateTaskCommentDto } from './dto/create-task-comment.dto';
import { UpdateTaskCommentDto } from './dto/update-task-comment.dto';
import { BaseQueryDto } from '../common/dto/base-query.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayloadType } from '../auth/strategies/types/jwt-payload.type';
import { AuditLogInterceptor } from '../audit-logs/audit-log.interceptor';
import { createResponse, createPaginatedResponse } from '../common/utils/base-response';
import { extractQueryOptions } from '../common/helpers/query-options.helper';
import { API_PAGE_LIMIT } from '../common/constants/common.constant';

@UseInterceptors(AuditLogInterceptor)
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Task Comments')
@Controller({ version: '1' })
export class TaskCommentsController {
  constructor(private readonly service: TaskCommentsService) {}

  @Get('tasks/:taskId/comments')
  @SetMetadata('abilities', [['browse', 'task_comments']])
  @HttpCode(HttpStatus.OK)
  async findByTask(
    @Param('taskId') taskId: string,
    @Query() query: BaseQueryDto,
  ) {
    const { paginationOptions } = extractQueryOptions(query, API_PAGE_LIMIT);
    const { items, meta } = await this.service.findByTask(taskId, paginationOptions);
    return createPaginatedResponse('Task comments fetched successfully', items, meta);
  }

  @Post('tasks/:taskId/comments')
  @SetMetadata('abilities', [['add', 'task_comments']])
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('taskId') taskId: string,
    @CurrentUser() currentUser: JwtPayloadType,
    @Body() dto: CreateTaskCommentDto,
  ) {
    const item = await this.service.create(taskId, currentUser.id, dto);
    return createResponse('Task comment added successfully', item);
  }

  @Patch('task-comments/:id')
  @SetMetadata('abilities', [['edit', 'task_comments']])
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @CurrentUser() currentUser: JwtPayloadType,
    @Body() dto: UpdateTaskCommentDto,
  ) {
    const item = await this.service.update(id, currentUser.id, dto);
    return createResponse('Task comment updated successfully', item);
  }

  @Delete('task-comments/:id')
  @SetMetadata('abilities', [['delete', 'task_comments']])
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: JwtPayloadType,
  ): Promise<void> {
    await this.service.remove(id, currentUser.id);
  }
}
