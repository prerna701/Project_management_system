import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IssuesService } from './issues.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueStatusDto } from './dto/update-issue-status.dto';
import { BaseQueryDto } from '../common/dto/base-query.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayloadType } from '../auth/strategies/types/jwt-payload.type';
import { createResponse, createPaginatedResponse } from '../common/utils/base-response';
import { extractQueryOptions } from '../common/helpers/query-options.helper';
import { API_PAGE_LIMIT } from '../common/constants/common.constant';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Issues')
@Controller({ version: '1' })
export class IssuesController {
  constructor(private readonly service: IssuesService) {}

  @Post('issues')
  @SetMetadata('abilities', [['add', 'issues']])
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateIssueDto,
    @CurrentUser() currentUser: JwtPayloadType,
  ) {
    const item = await this.service.create(dto, currentUser.id);
    return createResponse('Issue raised successfully', item);
  }

  @Get('projects/:projectId/issues')
  @SetMetadata('abilities', [['browse', 'issues']])
  @HttpCode(HttpStatus.OK)
  async findByProject(
    @Param('projectId') projectId: string,
    @Query() query: BaseQueryDto,
  ) {
    const { paginationOptions } = extractQueryOptions(query, API_PAGE_LIMIT);
    const { items, meta } = await this.service.findByProject(projectId, paginationOptions, query.search);
    return createPaginatedResponse('Issues fetched successfully', items, meta);
  }

  @Get('issues/:id')
  @SetMetadata('abilities', [['browse', 'issues']])
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    const item = await this.service.findById(id);
    return createResponse('Issue fetched successfully', item);
  }

  @Patch('issues/:id/status')
  @SetMetadata('abilities', [['edit', 'issues']])
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateIssueStatusDto,
  ) {
    const item = await this.service.updateStatus(id, dto);
    return createResponse('Issue status updated successfully', item);
  }
}
