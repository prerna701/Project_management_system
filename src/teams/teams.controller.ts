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
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { TransferMemberDto } from './dto/transfer-member.dto';
import { BaseQueryDto } from '../common/dto/base-query.dto';
import { AuditLogInterceptor } from '../audit-logs/audit-log.interceptor';
import { AuditLog } from '../audit-logs/audit-log.decorator';
import { createResponse, createPaginatedResponse } from '../common/utils/base-response';
import { extractQueryOptions } from '../common/helpers/query-options.helper';
import { API_PAGE_LIMIT } from '../common/constants/common.constant';

@UseInterceptors(AuditLogInterceptor)
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Teams')
@Controller({ path: 'teams', version: '1' })
export class TeamsController {
  constructor(private readonly service: TeamsService) {}

  @Get()
  @SetMetadata('abilities', [['browse', 'teams']])

  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: BaseQueryDto) {
    const { paginationOptions } = extractQueryOptions(query, API_PAGE_LIMIT);
    const { items, meta } = await this.service.findAll(paginationOptions, query.search);
    return createPaginatedResponse('Teams fetched successfully', items, meta);
  }

  @Get(':id')
  @SetMetadata('abilities', [['read', 'teams']])

  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    const item = await this.service.findById(id);
    return createResponse('Team fetched successfully', item);
  }

  @AuditLog({
    module: 'Teams',
    entityName: '{entityName}',
    descriptionTemplate: 'Created Team "{entityName}"',
    impact: 'medium',
  })
  @Post()
  @SetMetadata('abilities', [['add', 'teams']])

  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTeamDto) {
    const item = await this.service.create(dto);
    return createResponse('Team created successfully', item);
  }

  @AuditLog({
    module: 'Teams',
    entityName: '{entityName}',
    descriptionTemplate: 'Updated Team "{entityName}"',
    impact: 'medium',
    trackChanges: true,
  })
  @Patch(':id')
  @SetMetadata('abilities', [['edit', 'teams']])

  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() dto: UpdateTeamDto) {
    const item = await this.service.update(id, dto);
    return createResponse('Team updated successfully', item);
  }

  @Delete(':id')
  @SetMetadata('abilities', [['delete', 'teams']])

  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.service.remove(id);
  }

  @Get(':id/members')
  @SetMetadata('abilities', [['read', 'teams']])

  @HttpCode(HttpStatus.OK)
  async getMembers(@Param('id') id: string) {
    const members = await this.service.getMembers(id);
    return createResponse('Team members fetched successfully', members);
  }

  @AuditLog({
    module: 'Teams',
    entityName: '{entityName}',
    descriptionTemplate: 'Added member to Team "{entityName}"',
    impact: 'medium',
  })
  @Post(':id/members')
  @SetMetadata('abilities', [['add_member', 'teams']])

  @HttpCode(HttpStatus.CREATED)
  async addMember(@Param('id') id: string, @Body() dto: AddTeamMemberDto) {
    const member = await this.service.addMember(id, dto);
    return createResponse('Member added to team successfully', member);
  }

  @AuditLog({
    module: 'Teams',
    entityName: '{entityName}',
    descriptionTemplate: 'Removed member from Team "{entityName}"',
    impact: 'medium',
  })
  @Delete(':id/members/:userId')
  @SetMetadata('abilities', [['remove_member', 'teams']])

  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(@Param('id') id: string, @Param('userId') userId: string): Promise<void> {
    await this.service.removeMember(id, userId);
  }

  @AuditLog({
    module: 'Teams',
    entityName: '{entityName}',
    descriptionTemplate: 'Transferred member between teams',
    impact: 'high',
  })
  @Post('transfer-member')
  @SetMetadata('abilities', [['transfer_member', 'teams']])

  @HttpCode(HttpStatus.OK)
  async transferMember(@Body() dto: TransferMemberDto) {
    const member = await this.service.transferMember(dto);
    return createResponse('Member transferred successfully', member);
  }
}
