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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayloadType } from '../auth/strategies/types/jwt-payload.type';
import { AddTeamMembersDto } from './dto/add-team-members.dto';

@UseInterceptors(AuditLogInterceptor)
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Teams')
@Controller({ path: 'teams', version: '1' })
export class TeamsController {
  constructor(private readonly service: TeamsService) {}

  @Get('assignable-users')
  @SetMetadata('abilities', [['add_member', 'teams']])
  @HttpCode(HttpStatus.OK)
  async getAssignableUsers(@Query('search') search?: string) {
    const users = await this.service.getAssignableUsers(search);
    return createResponse('Assignable users fetched successfully', users);
  }

  @Get()
  @SetMetadata('abilities', [['browse', 'teams']])

  @HttpCode(HttpStatus.OK)
  async findAll(
    @CurrentUser() user: JwtPayloadType,
    @Query() query: BaseQueryDto,
  ) {
    const { paginationOptions } = extractQueryOptions(query, API_PAGE_LIMIT);
    const { items, meta } = await this.service.findAll(
      user,
      paginationOptions,
      query.search,
    );
    return createPaginatedResponse('Teams fetched successfully', items, meta);
  }

  @Get(':id')
  @SetMetadata('abilities', [['read', 'teams']])

  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayloadType,
  ) {
    const item = await this.service.findById(id, user);
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
  async create(
    @Body() dto: CreateTeamDto,
    @CurrentUser() user: JwtPayloadType,
  ) {
    const item = await this.service.create(dto, user);
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
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTeamDto,
    @CurrentUser() user: JwtPayloadType,
  ) {
    const item = await this.service.update(id, dto, user);
    return createResponse('Team updated successfully', item);
  }

  @Delete(':id')
  @SetMetadata('abilities', [['delete', 'teams']])

  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayloadType,
  ): Promise<void> {
    await this.service.remove(id, user);
  }

  @Get(':id/members')
  @SetMetadata('abilities', [['read', 'teams']])

  @HttpCode(HttpStatus.OK)
  async getMembers(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayloadType,
  ) {
    const members = await this.service.getMembers(id, user);
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
  async addMember(
    @Param('id') id: string,
    @Body() dto: AddTeamMemberDto,
    @CurrentUser() user: JwtPayloadType,
  ) {
    const member = await this.service.addMember(id, dto, user.id, user);
    return createResponse('Member added to team successfully', member);
  }

  @Post(':id/members/bulk')
  @SetMetadata('abilities', [['add_member', 'teams']])
  @HttpCode(HttpStatus.CREATED)
  async addMembers(
    @Param('id') id: string,
    @Body() dto: AddTeamMembersDto,
    @CurrentUser() user: JwtPayloadType,
  ) {
    const members = await this.service.addMembers(id, dto, user);
    return createResponse('Members added to team successfully', members);
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
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @CurrentUser() user: JwtPayloadType,
  ): Promise<void> {
    await this.service.removeMember(id, userId, user);
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
  async transferMember(
    @Body() dto: TransferMemberDto,
    @CurrentUser() user: JwtPayloadType,
  ) {
    const member = await this.service.transferMember(dto, user.id, user);
    return createResponse('Member transferred successfully', member);
  }
}
