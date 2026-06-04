import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReleaseNotesService } from './release-notes.service';
import { CreateReleaseNoteDto } from './dto/create-release-note.dto';
import { BaseQueryDto } from '../common/dto/base-query.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayloadType } from '../auth/strategies/types/jwt-payload.type';
import { createResponse, createPaginatedResponse } from '../common/utils/base-response';
import { extractQueryOptions } from '../common/helpers/query-options.helper';
import { API_PAGE_LIMIT } from '../common/constants/common.constant';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Release Notes')
@Controller({ version: '1' })
export class ReleaseNotesController {
  constructor(private readonly service: ReleaseNotesService) {}

  @Post('projects/:projectId/release-notes')
  @SetMetadata('abilities', [['add', 'release_notes']])
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateReleaseNoteDto,
    @CurrentUser() currentUser: JwtPayloadType,
  ) {
    const item = await this.service.create(projectId, dto, currentUser.id);
    return createResponse('Release note created successfully', item);
  }

  @Get('projects/:projectId/release-notes')
  @SetMetadata('abilities', [['browse', 'release_notes']])
  @HttpCode(HttpStatus.OK)
  async findByProject(
    @Param('projectId') projectId: string,
    @Query() query: BaseQueryDto,
  ) {
    const { paginationOptions } = extractQueryOptions(query, API_PAGE_LIMIT);
    const { items, meta } = await this.service.findByProject(projectId, paginationOptions);
    return createPaginatedResponse('Release notes fetched successfully', items, meta);
  }

  @Get('release-notes/:id')
  @SetMetadata('abilities', [['browse', 'release_notes']])
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    const item = await this.service.findById(id);
    return createResponse('Release note fetched successfully', item);
  }
}
