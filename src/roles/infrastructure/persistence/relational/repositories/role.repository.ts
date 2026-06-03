import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from '../entities/role.entity';
import { RoleRepository } from '../../role.repository';
import { Role } from '../../../../domain/role';
import { RoleMapper } from '../mappers/role.mapper';

@Injectable()
export class RelationalRoleRepository implements RoleRepository {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
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
}
