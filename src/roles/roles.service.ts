import { Injectable, NotFoundException } from '@nestjs/common';
import { RoleRepository } from './infrastructure/persistence/role.repository';
import { Role } from './domain/role';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { TryCatch } from '../common/utils/try-catch.util';
import { PermissionsService } from '../permissions/permissions.service';

@Injectable()
export class RolesService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly permissionsService: PermissionsService,
  ) {}

  @TryCatch('Failed to fetch roles')
  async findAll(): Promise<Role[]> {
    return this.roleRepository.findAll();
  }

  async findById(id: number): Promise<Role> {
    const role = await this.roleRepository.findById(id);
    if (!role) throw new NotFoundException(`Role #${id} not found`);
    return role;
  }

  @TryCatch('Failed to create role')
  async create(dto: CreateRoleDto): Promise<Role> {
    return this.roleRepository.create(dto);
  }

  @TryCatch('Failed to update role')
  async update(id: number, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.roleRepository.update(id, dto);
    if (!role) throw new NotFoundException(`Role #${id} not found`);
    return role;
  }

  @TryCatch('Failed to remove role')
  async remove(id: number): Promise<void> {
    await this.roleRepository.remove(id);
  }

  @TryCatch('Failed to assign permission')
  async assignPermission(roleId: number, permissionId: number): Promise<void> {
    await this.findById(roleId);
    await this.permissionsService.findById(permissionId);
    await this.roleRepository.assignPermission(roleId, permissionId);
  }

  @TryCatch('Failed to remove permission')
  async removePermission(roleId: number, permissionId: number): Promise<void> {
    await this.findById(roleId);
    await this.permissionsService.findById(permissionId);
    await this.roleRepository.removePermission(roleId, permissionId);
  }
}
