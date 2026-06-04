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
import { MilestonesService } from './milestones.service';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { BaseQueryDto } from '../common/dto/base-query.dto';
import { AuditLogInterceptor } from '../audit-logs/audit-log.interceptor';
import { AuditLog } from '../audit-logs/audit-log.decorator';
import { createResponse, createPaginatedResponse } from '../common/utils/base-response';
import { extractQueryOptions } from '../common/helpers/query-options.helper';
import { API_PAGE_LIMIT } from '../common/constants/common.constant';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayloadType } from '../auth/strategies/types/jwt-payload.type';

@UseInterceptors(AuditLogInterceptor)
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Milestones')
@Controller({ version: '1' })
export class MilestonesController {
  constructor(private readonly service: MilestonesService) {}

  @Get('projects/:projectId/milestones')
  @SetMetadata('abilities', [['browse', 'milestones']])

  @HttpCode(HttpStatus.OK)
  async findByProject(@Param('projectId') projectId: string, @Query() query: BaseQueryDto) {
    const { paginationOptions } = extractQueryOptions(query, API_PAGE_LIMIT);
    const { items, meta } = await this.service.findByProjectId(projectId, paginationOptions, query.search);
    return createPaginatedResponse('Milestones fetched successfully', items, meta);
  }

  @Get('milestones/:id')
  @SetMetadata('abilities', [['read', 'milestones']])

  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    const item = await this.service.findById(id);
    return createResponse('Milestone fetched successfully', item);
  }

  @AuditLog({
    module: 'Milestones',
    entityName: '{entityName}',
    descriptionTemplate: 'Created Milestone "{entityName}"',
    impact: 'medium',
  })
  @Post('projects/:projectId/milestones')
  @SetMetadata('abilities', [['add', 'milestones']])

  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateMilestoneDto,
    @CurrentUser() currentUser: JwtPayloadType,
  ) {
    const item = await this.service.create(projectId, dto, currentUser.id);
    return createResponse('Milestone created successfully', item);
  }

  @AuditLog({
    module: 'Milestones',
    entityName: '{entityName}',
    descriptionTemplate: 'Updated Milestone "{entityName}"',
    impact: 'medium',
    trackChanges: true,
  })
  @Patch('milestones/:id')
  @SetMetadata('abilities', [['edit', 'milestones']])

  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMilestoneDto,
    @CurrentUser() currentUser: JwtPayloadType,
  ) {
    const item = await this.service.update(id, dto, currentUser.id);
    return createResponse('Milestone updated successfully', item);
  }

  @Get('milestones/:id/timeline')
  @SetMetadata('abilities', [['read', 'milestones']])
  @HttpCode(HttpStatus.OK)
  async getStatusTimeline(@Param('id') id: string) {
    await this.service.findById(id);
    const items = await this.service.getStatusHistory(id);
    return createResponse('Milestone status timeline fetched successfully', items);
  }

  @Delete('milestones/:id')
  @SetMetadata('abilities', [['delete', 'milestones']])

  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: JwtPayloadType,
  ): Promise<void> {
    await this.service.remove(id, currentUser.id);
  }
}
