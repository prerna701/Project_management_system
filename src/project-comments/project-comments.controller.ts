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
import { ProjectCommentsService } from './project-comments.service';
import { CreateProjectCommentDto } from './dto/create-project-comment.dto';
import { UpdateProjectCommentDto } from './dto/update-project-comment.dto';
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
@ApiTags('Project Comments')
@Controller({ version: '1' })
export class ProjectCommentsController {
  constructor(private readonly service: ProjectCommentsService) {}

  @Get('projects/:projectId/comments')
  @SetMetadata('abilities', [['browse', 'project_comments']])
  @HttpCode(HttpStatus.OK)
  async findByProject(
    @Param('projectId') projectId: string,
    @Query() query: BaseQueryDto,
  ) {
    const { paginationOptions } = extractQueryOptions(query, API_PAGE_LIMIT);
    const { items, meta } = await this.service.findByProject(projectId, paginationOptions);
    return createPaginatedResponse('Comments fetched successfully', items, meta);
  }

  @Post('projects/:projectId/comments')
  @SetMetadata('abilities', [['add', 'project_comments']])
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('projectId') projectId: string,
    @CurrentUser() currentUser: JwtPayloadType,
    @Body() dto: CreateProjectCommentDto,
  ) {
    const item = await this.service.create(projectId, currentUser.id, dto);
    return createResponse('Comment added successfully', item);
  }

  @Patch('project-comments/:id')
  @SetMetadata('abilities', [['edit', 'project_comments']])
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @CurrentUser() currentUser: JwtPayloadType,
    @Body() dto: UpdateProjectCommentDto,
  ) {
    const item = await this.service.update(id, currentUser.id, dto);
    return createResponse('Comment updated successfully', item);
  }

  @Delete('project-comments/:id')
  @SetMetadata('abilities', [['delete', 'project_comments']])
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: JwtPayloadType,
  ): Promise<void> {
    await this.service.remove(id, currentUser.id);
  }
}
