import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { createResponse } from '../common/utils/base-response';
import { AssignPermissionDto } from '../permissions/dto/assign-permission.dto';
import { SetPermissionsDto } from '../permissions/dto/set-permissions.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Roles')
@Controller({ path: 'roles', version: '1' })
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @SetMetadata('abilities', [['browse', 'roles']])
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const roles = await this.rolesService.findAll();
    return createResponse('Roles fetched successfully', roles);
  }

  @Get(':id')
  @SetMetadata('abilities', [['read', 'roles']])
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const role = await this.rolesService.findById(id);
    return createResponse('Role fetched successfully', role);
  }

  @Post()
  @SetMetadata('abilities', [['add', 'roles']])
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateRoleDto) {
    const role = await this.rolesService.create(dto);
    return createResponse('Role created successfully', role);
  }

  @Patch(':id')
  @SetMetadata('abilities', [['edit', 'roles']])
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
  ) {
    const role = await this.rolesService.update(id, dto);
    return createResponse('Role updated successfully', role);
  }

  @Delete(':id')
  @SetMetadata('abilities', [['delete', 'roles']])
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.rolesService.remove(id);
  }

  @Get(':id/permissions')
  @SetMetadata('abilities', [['read', 'roles']])
  @HttpCode(HttpStatus.OK)
  async getPermissions(@Param('id', ParseIntPipe) id: number) {
    const permissions = await this.rolesService.getPermissions(id);
    return createResponse('Role permissions fetched successfully', permissions);
  }

  @Get(':id/permissions/matrix')
  @SetMetadata('abilities', [['read', 'roles']])
  @HttpCode(HttpStatus.OK)
  async getPermissionMatrix(@Param('id', ParseIntPipe) id: number) {
    const matrix = await this.rolesService.getPermissionMatrix(id);
    return createResponse('Role permission matrix fetched successfully', matrix);
  }

  @Put(':id/permissions')
  @SetMetadata('abilities', [['edit', 'roles']])
  @HttpCode(HttpStatus.OK)
  async setPermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetPermissionsDto,
  ) {
    await this.rolesService.setPermissions(id, dto.permissionIds);
    return createResponse('Role permissions saved successfully', null);
  }

  @Post(':id/permissions')
  @SetMetadata('abilities', [['edit', 'roles']])
  @HttpCode(HttpStatus.OK)
  async assignPermission(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignPermissionDto,
  ) {
    await this.rolesService.assignPermission(id, dto.permissionId);
    return createResponse('Permission assigned to role successfully', null);
  }

  @Delete(':id/permissions/:permissionId')
  @SetMetadata('abilities', [['edit', 'roles']])
  @HttpCode(HttpStatus.NO_CONTENT)
  async removePermission(
    @Param('id', ParseIntPipe) id: number,
    @Param('permissionId', ParseIntPipe) permissionId: number,
  ): Promise<void> {
    await this.rolesService.removePermission(id, permissionId);
  }
}
