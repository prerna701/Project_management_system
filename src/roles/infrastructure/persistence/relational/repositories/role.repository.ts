import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from '../entities/role.entity';
import { RoleRepository } from '../../role.repository';
import { Role } from '../../../../domain/role';
import { RoleMapper } from '../mappers/role.mapper';
import { RolePermissionEntity } from '../../../../../users/infrastructure/persistence/relational/entities/role-permission.entity';

@Injectable()
export class RelationalRoleRepository implements RoleRepository {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(RolePermissionEntity)
    private readonly rolePermissionRepository: Repository<RolePermissionEntity>,
  ) {}

  async findById(id: number): Promise<Role | null> {
    const entity = await this.roleRepository.findOne({ where: { id } });
    return entity ? RoleMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<Role[]> {
    const entities = await this.roleRepository.find();
    return entities.map(RoleMapper.toDomain);
  }

  async create(role: Partial<Role>): Promise<Role> {
    const entity = this.roleRepository.create(role as any);
    const saved = await this.roleRepository.save(entity) as unknown as RoleEntity;
    return RoleMapper.toDomain(saved);
  }

  async update(id: number, role: Partial<Role>): Promise<Role | null> {
    await this.roleRepository.update(id, role as any);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    await this.roleRepository.delete(id);
  }

  async assignPermission(roleId: number, permissionId: number): Promise<void> {
    const existing = await this.rolePermissionRepository.findOne({
      where: { roleId, permissionId },
    });
    if (!existing) {
      await this.rolePermissionRepository.save({ roleId, permissionId });
    }
  }

  async removePermission(roleId: number, permissionId: number): Promise<void> {
    await this.rolePermissionRepository.delete({ roleId, permissionId });
  }
}
