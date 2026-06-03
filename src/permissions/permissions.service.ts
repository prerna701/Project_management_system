import { Injectable, NotFoundException } from '@nestjs/common';
import { PermissionRepository } from './infrastructure/persistence/permission.repository';
import { Permission } from './domain/permission';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { TryCatch } from '../common/utils/try-catch.util';

@Injectable()
export class PermissionsService {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  @TryCatch('Failed to fetch permissions')
  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.findAll();
  }

  async findById(id: number): Promise<Permission> {
    const perm = await this.permissionRepository.findById(id);
    if (!perm) throw new NotFoundException(`Permission #${id} not found`);
    return perm;
  }

  @TryCatch('Failed to fetch permissions by module')
  async findByModule(module: string): Promise<Permission[]> {
    return this.permissionRepository.findByModule(module);
  }

  @TryCatch('Failed to create permission')
  async create(dto: CreatePermissionDto): Promise<Permission> {
    return this.permissionRepository.create(dto);
  }

  @TryCatch('Failed to update permission')
  async update(id: number, dto: UpdatePermissionDto): Promise<Permission> {
    const perm = await this.permissionRepository.update(id, dto);
    if (!perm) throw new NotFoundException(`Permission #${id} not found`);
    return perm;
  }

  @TryCatch('Failed to remove permission')
  async remove(id: number): Promise<void> {
    await this.permissionRepository.remove(id);
  }
}
