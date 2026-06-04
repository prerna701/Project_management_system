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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SubtaskCommentsService } from './subtask-comments.service';
import { CreateSubtaskCommentDto } from './dto/create-subtask-comment.dto';
import { UpdateSubtaskCommentDto } from './dto/update-subtask-comment.dto';
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
@ApiTags('Subtask Comments')
@Controller({ version: '1' })
export class SubtaskCommentsController {
  constructor(private readonly service: SubtaskCommentsService) {}

  @Get('subtasks/:subtaskId/comments')
  @HttpCode(HttpStatus.OK)
  async findBySubtask(
    @Param('subtaskId') subtaskId: string,
    @CurrentUser() currentUser: JwtPayloadType,
    @Query() query: BaseQueryDto,
  ) {
    const { paginationOptions } = extractQueryOptions(query, API_PAGE_LIMIT);
    const { items, meta } = await this.service.findBySubtask(subtaskId, currentUser.id, paginationOptions);
    return createPaginatedResponse('Subtask comments fetched successfully', items, meta);
  }

  @Post('subtasks/:subtaskId/comments')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('subtaskId') subtaskId: string,
    @CurrentUser() currentUser: JwtPayloadType,
    @Body() dto: CreateSubtaskCommentDto,
  ) {
    const item = await this.service.create(subtaskId, currentUser.id, dto);
    return createResponse('Subtask comment added successfully', item);
  }

  @Post('subtask-comments/:id/replies')
  @HttpCode(HttpStatus.CREATED)
  async reply(
    @Param('id') id: string,
    @CurrentUser() currentUser: JwtPayloadType,
    @Body() dto: CreateSubtaskCommentDto,
  ) {
    const item = await this.service.reply(id, currentUser.id, dto);
    return createResponse('Subtask comment reply added successfully', item);
  }

  @Patch('subtask-comments/:id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @CurrentUser() currentUser: JwtPayloadType,
    @Body() dto: UpdateSubtaskCommentDto,
  ) {
    const item = await this.service.update(id, currentUser.id, dto);
    return createResponse('Subtask comment updated successfully', item);
  }

  @Delete('subtask-comments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: JwtPayloadType,
  ): Promise<void> {
    await this.service.remove(id, currentUser.id);
  }
}
