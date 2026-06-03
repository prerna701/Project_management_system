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
