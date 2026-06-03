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
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AssignTeamDto } from './dto/assign-team.dto';
import { AddClientDto } from './dto/add-client.dto';
import { BaseQueryDto } from '../common/dto/base-query.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayloadType } from '../auth/strategies/types/jwt-payload.type';
import { AuditLogInterceptor } from '../audit-logs/audit-log.interceptor';
import { AuditLog } from '../audit-logs/audit-log.decorator';
import { createResponse, createPaginatedResponse } from '../common/utils/base-response';
import { extractQueryOptions } from '../common/helpers/query-options.helper';
import { API_PAGE_LIMIT } from '../common/constants/common.constant';

@UseInterceptors(AuditLogInterceptor)
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Projects')
@Controller({ path: 'projects', version: '1' })
export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @CurrentUser() currentUser: JwtPayloadType,
    @Query() query: BaseQueryDto,
  ) {
    const { paginationOptions } = extractQueryOptions(query, API_PAGE_LIMIT);
    const { items, meta } = await this.service.findAll(
      currentUser,
      paginationOptions,
      query.search,
    );
    return createPaginatedResponse('Projects fetched successfully', items, meta);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: JwtPayloadType,
  ) {
    const item = await this.service.findById(id, currentUser);
    return createResponse('Project fetched successfully', item);
  }

  @AuditLog({
    module: 'Projects',
    entityName: '{entityName}',
    descriptionTemplate: 'Created Project "{entityName}"',
    impact: 'medium',
  })
  @Post()
  @SetMetadata('abilities', [['add', 'projects']])

  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateProjectDto) {
    const item = await this.service.create(dto);
    return createResponse('Project created successfully', item);
  }

  @AuditLog({
    module: 'Projects',
    entityName: '{entityName}',
    descriptionTemplate: 'Updated Project "{entityName}"',
    impact: 'medium',
    trackChanges: true,
  })
  @Patch(':id')
  @SetMetadata('abilities', [['edit', 'projects']])
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() currentUser: JwtPayloadType,
  ) {
    const item = await this.service.update(id, dto, currentUser.id);
    return createResponse('Project updated successfully', item);
  }

  @Get(':id/status-history')
  @SetMetadata('abilities', [['read', 'projects']])
  @HttpCode(HttpStatus.OK)
  async statusHistory(@Param('id') id: string) {
    const items = await this.service.getStatusHistory(id);
    return createResponse('Status history fetched successfully', items);
  }

  @Get(':id/completion')
  @SetMetadata('abilities', [['read', 'projects']])
  @HttpCode(HttpStatus.OK)
  async completionPercentage(@Param('id') id: string) {
    const percentage = await this.service.getCompletionPercentage(id);
    return createResponse('Completion percentage fetched successfully', { completionPercentage: percentage });
  }

  @Delete(':id')
  @SetMetadata('abilities', [['delete', 'projects']])

  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.service.remove(id);
  }

  @AuditLog({
    module: 'Projects',
    entityName: '{entityName}',
    descriptionTemplate: 'Assigned team to Project "{entityName}"',
    impact: 'medium',
  })
  @Patch(':id/team')
  @SetMetadata('abilities', [['assign_team', 'projects']])
  @HttpCode(HttpStatus.OK)
  async assignTeam(@Param('id') id: string, @Body() dto: AssignTeamDto) {
    const item = await this.service.assignTeam(id, dto);
    return createResponse('Team assigned to project successfully', item);
  }

  @Get(':id/clients')
  @SetMetadata('abilities', [['browse', 'project_clients']])
  @HttpCode(HttpStatus.OK)
  async listClients(@Param('id') id: string) {
    const items = await this.service.findClients(id);
    return createResponse('Project clients fetched successfully', items);
  }

  @AuditLog({
    module: 'Projects',
    entityName: '{entityName}',
    descriptionTemplate: 'Added client to Project "{entityName}"',
    impact: 'medium',
  })
  @Post(':id/clients')
  @SetMetadata('abilities', [['add', 'project_clients']])
  @HttpCode(HttpStatus.CREATED)
  async addClient(
    @Param('id') id: string,
    @Body() dto: AddClientDto,
    @CurrentUser() currentUser: JwtPayloadType,
  ) {
    await this.service.addClient(id, dto, currentUser.id);
    return createResponse('Client added to project successfully', null);
  }

  @AuditLog({
    module: 'Projects',
    entityName: '{entityName}',
    descriptionTemplate: 'Removed client from Project "{entityName}"',
    impact: 'medium',
  })
  @Delete(':id/clients/:userId')
  @SetMetadata('abilities', [['delete', 'project_clients']])
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeClient(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    await this.service.removeClient(id, userId);
  }

  @Get(':id/users')
  @SetMetadata('abilities', [['browse', 'project_users']])
  @HttpCode(HttpStatus.OK)
  async portalUsers(@Param('id') id: string) {
    const items = await this.service.getPortalUsers(id);
    return createResponse('Portal users fetched successfully', items);
  }
}
