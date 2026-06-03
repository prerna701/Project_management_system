import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionEntity } from '../entities/permission.entity';
import { PermissionRepository } from '../../permission.repository';
import { Permission } from '../../../../domain/permission';
import { PermissionMapper } from '../mappers/permission.mapper';

@Injectable()
export class RelationalPermissionRepository implements PermissionRepository {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly permissionRepo: Repository<PermissionEntity>,
  ) {}

  async findById(id: number): Promise<Permission | null> {
    const entity = await this.permissionRepo.findOne({ where: { id } });
    return entity ? PermissionMapper.toDomain(entity) : null;
  }

  async findByName(name: string): Promise<Permission | null> {
    const entity = await this.permissionRepo.findOne({ where: { name } });
    return entity ? PermissionMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<Permission[]> {
    const entities = await this.permissionRepo.find();
    return entities.map(PermissionMapper.toDomain);
  }

  async findByModule(module: string): Promise<Permission[]> {
    const entities = await this.permissionRepo.find({ where: { module } });
    return entities.map(PermissionMapper.toDomain);
  }

  async create(permission: Partial<Permission>): Promise<Permission> {
    const entity = this.permissionRepo.create(permission as any);
    const saved = await this.permissionRepo.save(entity) as unknown as PermissionEntity;
    return PermissionMapper.toDomain(saved);
  }

  async update(id: number, permission: Partial<Permission>): Promise<Permission | null> {
    await this.permissionRepo.update(id, permission as any);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    await this.permissionRepo.delete(id);
  }
}
