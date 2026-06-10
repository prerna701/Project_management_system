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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentQueryDto } from './dto/comment-query.dto';
import { CommentableEntity } from './enums/commentable-entity.enum';
import { AuditLogInterceptor } from '../audit-logs/audit-log.interceptor';
import { AuditLog } from '../audit-logs/audit-log.decorator';
import { createResponse, createPaginatedResponse } from '../common/utils/base-response';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayloadType } from '../auth/strategies/types/jwt-payload.type';
import { RoleEnum } from '../roles/roles.enum';
import { BasePaginationQueryDto } from '../common/dto/base-query.dto';
import { extractPaginationOptions } from '../common/helpers/query-options.helper';

@UseInterceptors(AuditLogInterceptor)
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Comments')
@Controller({ version: '1' })
export class CommentsController {
  constructor(private readonly service: CommentsService) {}

  // ─── Generic endpoints ───────────────────────────────────────────────────────

  @Get('comments')
  @SetMetadata('abilities', [['browse', 'comments']])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List comments for any entity (entityType + entityId required)' })
  async findAll(@Query() query: CommentQueryDto) {
    const paginationOptions = { page: query.page ?? 1, limit: query.limit ?? 20 };
    const parentId = query.parentId !== undefined ? query.parentId : null;
    const { items, meta } = await this.service.findByEntity(
      query.entityType,
      query.entityId,
      paginationOptions,
      parentId,
    );
    return createPaginatedResponse('Comments fetched successfully', items, meta);
  }

  @Get('comments/:id')
  @SetMetadata('abilities', [['read', 'comments']])
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    const item = await this.service.findById(id);
    return createResponse('Comment fetched successfully', item);
  }

  @AuditLog({
    module: 'Comments',
    entityName: 'Comment',
    descriptionTemplate: 'Created a comment on {entityName}',
    impact: 'low',
  })
  @Post('comments')
  @SetMetadata('abilities', [['add', 'comments']])
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a comment on any entity' })
  async create(
    @CurrentUser() user: JwtPayloadType,
    @Body() dto: CreateCommentDto,
  ) {
    const item = await this.service.create(user.id, dto, user);
    return createResponse('Comment created successfully', item);
  }

  @AuditLog({
    module: 'Comments',
    entityName: 'Comment',
    descriptionTemplate: 'Edited comment',
    impact: 'low',
    trackChanges: true,
  })
  @Patch('comments/:id')
  @SetMetadata('abilities', [['edit', 'comments']])
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayloadType,
    @Body() dto: UpdateCommentDto,
  ) {
    const item = await this.service.update(id, user.id, dto);
    return createResponse('Comment updated successfully', item);
  }

  @AuditLog({
    module: 'Comments',
    entityName: 'Comment',
    descriptionTemplate: 'Deleted comment',
    impact: 'low',
  })
  @Delete('comments/:id')
  @SetMetadata('abilities', [['delete', 'comments']])
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayloadType,
  ): Promise<void> {
    const isAdmin = user.role?.id === RoleEnum.admin;
    await this.service.remove(id, user.id, isAdmin);
  }

  // ─── Milestone-scoped endpoints ───────────────────────────────────────────────

  @Get('milestones/:milestoneId/comments')
  @SetMetadata('abilities', [['browse', 'comments']])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List comments on a milestone' })
  async findMilestoneComments(
    @Param('milestoneId') milestoneId: string,
    @Query() query: BasePaginationQueryDto,
  ) {
    const paginationOptions = extractPaginationOptions(query);
    const { items, meta } = await this.service.findMilestoneComments(milestoneId, paginationOptions);
    return createPaginatedResponse('Milestone comments fetched successfully', items, meta);
  }

  @AuditLog({
    module: 'Comments',
    entityName: 'Milestone',
    descriptionTemplate: 'Commented on Milestone',
    impact: 'low',
  })
  @Post('milestones/:milestoneId/comments')
  @SetMetadata('abilities', [['add', 'comments']])
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a comment to a milestone' })
  async createMilestoneComment(
    @Param('milestoneId') milestoneId: string,
    @CurrentUser() user: JwtPayloadType,
    @Body() body: { content: string; mentions?: string[]; parentId?: string },
  ) {
    const item = await this.service.create(user.id, {
      entityType: CommentableEntity.MILESTONE,
      entityId: milestoneId,
      content: body.content,
      mentions: body.mentions,
      parentId: body.parentId,
    });
    return createResponse('Comment added successfully', item);
  }

  // ─── Task-scoped endpoints ────────────────────────────────────────────────────

  @Get('tasks/:taskId/comments')
  @SetMetadata('abilities', [['browse', 'comments']])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List comments on a task' })
  async findTaskComments(
    @Param('taskId') taskId: string,
    @CurrentUser() user: JwtPayloadType,
    @Query() query: BasePaginationQueryDto,
  ) {
    const paginationOptions = extractPaginationOptions(query);
    const { items, meta } = await this.service.findTaskComments(
      taskId,
      paginationOptions,
      user,
    );
    return createPaginatedResponse('Task comments fetched successfully', items, meta);
  }

  @AuditLog({
    module: 'Comments',
    entityName: 'Task',
    descriptionTemplate: 'Commented on Task',
    impact: 'low',
  })
  @Post('tasks/:taskId/comments')
  @SetMetadata('abilities', [['add', 'comments']])
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a comment to a task' })
  async createTaskComment(
    @Param('taskId') taskId: string,
    @CurrentUser() user: JwtPayloadType,
    @Body() body: { content: string; mentions?: string[]; parentId?: string },
  ) {
    const item = await this.service.create(user.id, {
      entityType: CommentableEntity.TASK,
      entityId: taskId,
      content: body.content,
      mentions: body.mentions,
      parentId: body.parentId,
    }, user);
    return createResponse('Comment added successfully', item);
  }

  // ─── Subtask-scoped endpoints ─────────────────────────────────────────────────

  @Get('subtasks/:subtaskId/comments')
  @SetMetadata('abilities', [['browse', 'comments']])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List comments on a subtask' })
  async findSubtaskComments(
    @Param('subtaskId') subtaskId: string,
    @CurrentUser() user: JwtPayloadType,
    @Query() query: BasePaginationQueryDto,
  ) {
    const paginationOptions = extractPaginationOptions(query);
    const { items, meta } = await this.service.findSubtaskComments(
      subtaskId,
      paginationOptions,
      user,
    );
    return createPaginatedResponse('Subtask comments fetched successfully', items, meta);
  }

  @AuditLog({
    module: 'Comments',
    entityName: 'Subtask',
    descriptionTemplate: 'Commented on Subtask',
    impact: 'low',
  })
  @Post('subtasks/:subtaskId/comments')
  @SetMetadata('abilities', [['add', 'comments']])
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a comment to a subtask' })
  async createSubtaskComment(
    @Param('subtaskId') subtaskId: string,
    @CurrentUser() user: JwtPayloadType,
    @Body() body: { content: string; mentions?: string[]; parentId?: string },
  ) {
    const item = await this.service.create(user.id, {
      entityType: CommentableEntity.SUBTASK,
      entityId: subtaskId,
      content: body.content,
      mentions: body.mentions,
      parentId: body.parentId,
    }, user);
    return createResponse('Comment added successfully', item);
  }
}
