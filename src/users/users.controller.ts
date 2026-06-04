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
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { ProjectsService } from '../projects/projects.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { AssignPermissionDto } from '../permissions/dto/assign-permission.dto';
import { User } from './domain/user';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { AuditLogInterceptor } from '../audit-logs/audit-log.interceptor';
import { AuditLog } from '../audit-logs/audit-log.decorator';
import { createResponse, createPaginatedResponse } from '../common/utils/base-response';
import { extractQueryOptions } from '../common/helpers/query-options.helper';
import { API_PAGE_LIMIT } from '../common/constants/common.constant';
import { PaginatedResponse } from '../common/dto/pagination-response.dto';
import { NullableType } from '../common/types/nullable.type';

// CaslAbilityGuard is registered globally in AppModule via APP_GUARD.
// @SetMetadata('abilities', [...]) on each handler activates it per-route.
@UseInterceptors(AuditLogInterceptor)
@ApiBearerAuth()
@Roles(RoleEnum.admin)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Users')
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly projectsService: ProjectsService,
  ) {}

  @AuditLog({
    module: 'Users',
    entityName: '{entityName}',
    descriptionTemplate: 'Created new user "{entityName}"',
    entityNamePath: 'data.email',
    impact: 'medium',
  })
  @ApiCreatedResponse({ type: User })
  @Post()
  @SetMetadata('abilities', [['add', 'users']])
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    return createResponse('User created successfully', user);
  }

  @ApiOkResponse({ type: PaginatedResponse(User) })
  @SetMetadata('abilities', [['browse', 'users']])
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@CurrentUser() _currentUser: User, @Query() query: UserQueryDto) {
    const { paginationOptions } = extractQueryOptions(query, API_PAGE_LIMIT);
    const { data, meta } = await this.usersService.findManyWithPagination({
      paginationOptions,
      search: query.search,
    });
    return createPaginatedResponse('Users fetched successfully', data, meta);
  }

  @ApiOkResponse({ type: User })
  @SetMetadata('abilities', [['read', 'users']])
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id') id: string): Promise<any> {
    const user = await this.usersService.findById(id, true);
    return createResponse('User fetched successfully', user);
  }

  @AuditLog({
    module: 'Users',
    entityName: '{entityName}',
    descriptionTemplate: 'Updated user "{entityName}"',
    entityNamePath: 'data.email',
    impact: 'medium',
    trackChanges: true,
  })
  @ApiOkResponse({ type: User })
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: String })
  @SetMetadata('abilities', [['edit', 'users']])
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto): Promise<any> {
    const user = await this.usersService.update(id, dto);
    return createResponse('User updated successfully', user);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: String })
  @SetMetadata('abilities', [['delete', 'users']])
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }

  @AuditLog({
    module: 'Users',
    entityName: 'Role Assignment',
    descriptionTemplate: 'Assigned role to user',
    impact: 'high',
  })
  @Post(':id/roles')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: String })
  @SetMetadata('abilities', [['edit', 'users']])
  async assignRole(@Param('id') id: string, @Body() dto: AssignRoleDto): Promise<any> {
    await this.usersService.assignRole(id, dto.roleId);
    return createResponse('Role assigned successfully', null);
  }

  @Delete(':id/roles/:roleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'roleId', type: Number })
  @SetMetadata('abilities', [['edit', 'users']])
  async removeRole(@Param('id') id: string, @Param('roleId') roleId: string): Promise<void> {
    await this.usersService.removeRole(id, Number(roleId));
  }

  @Post(':id/permissions')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: String })
  @SetMetadata('abilities', [['edit', 'users']])
  async assignPermission(
    @Param('id') id: string,
    @Body() dto: AssignPermissionDto,
  ): Promise<any> {
    await this.usersService.assignPermission(
      id,
      dto.permissionId,
      dto.resourceId,
      dto.resourceType,
    );
    return createResponse('Permission assigned successfully', null);
  }

  @Delete(':id/permissions/:permissionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'permissionId', type: Number })
  @SetMetadata('abilities', [['edit', 'users']])
  async removePermission(
    @Param('id') id: string,
    @Param('permissionId') permissionId: string,
  ): Promise<void> {
    await this.usersService.removePermission(id, Number(permissionId));
  }

  @Get(':id/roles')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: String })
  async getUserRoles(@Param('id') id: string): Promise<any> {
    const roles = await this.usersService.getUserRoles(id);
    return createResponse('User roles fetched successfully', roles);
  }

  @Get(':id/permissions')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: String })
  async getUserPermissions(@Param('id') id: string): Promise<any> {
    const perms = await this.usersService.getUserPermissions(id);
    return createResponse('User permissions fetched successfully', perms);
  }

  @Get(':id/projects')
  @SetMetadata('abilities', [['browse', 'projects']])
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', type: String })
  async getUserProjects(@Param('id') id: string): Promise<any> {
    const projects = await this.projectsService.getProjectsByUser(id);
    return createResponse('User projects fetched successfully', projects);
  }
}
