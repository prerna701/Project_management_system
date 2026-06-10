import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from '../entities/role.entity';
import { RoleRepository } from '../../role.repository';
import { Role } from '../../../../domain/role';
import { RoleMapper } from '../mappers/role.mapper';
import { RolePermissionEntity } from '../../../../../users/infrastructure/persistence/relational/entities/role-permission.entity';
import { PermissionEntity } from '../../../../../permissions/infrastructure/persistence/relational/entities/permission.entity';

@Injectable()
export class RelationalRoleRepository implements RoleRepository {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(RolePermissionEntity)
    private readonly rolePermissionRepository: Repository<RolePermissionEntity>,
    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
  ) {}

  async findById(id: number): Promise<Role | null> {
    const { entities, raw } = await this.createRoleCountQuery()
      .where('role.id = :id', { id })
      .getRawAndEntities();
    const entity = this.applyCounts(entities, raw)[0];
    return entity ? RoleMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<Role[]> {
    const { entities, raw } = await this.createRoleCountQuery().getRawAndEntities();
    return this.applyCounts(entities, raw).map(RoleMapper.toDomain);
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

  async getPermissions(roleId: number): Promise<any[]> {
    const assignments = await this.rolePermissionRepository.find({
      where: { roleId },
      relations: ['permission'],
    });
    return assignments.map((assignment) => assignment.permission);
  }

  async getPermissionMatrix(roleId: number): Promise<any[]> {
    const [allPermissions, assignments] = await Promise.all([
      this.permissionRepository.find({ order: { module: 'ASC', name: 'ASC' } }),
      this.rolePermissionRepository.find({ where: { roleId } }),
    ]);
    const assignedIds = new Set(assignments.map((a) => a.permissionId));
    return allPermissions.map((p) => ({ ...p, isAssigned: assignedIds.has(p.id) }));
  }

  async setPermissions(roleId: number, permissionIds: number[]): Promise<void> {
    await this.rolePermissionRepository.manager.transaction(async (manager) => {
      await manager.delete(RolePermissionEntity, { roleId });
      if (permissionIds.length > 0) {
        await manager.insert(
          RolePermissionEntity,
          permissionIds.map((permissionId) => ({ roleId, permissionId })),
        );
      }
    });
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

  private createRoleCountQuery() {
    return this.roleRepository
      .createQueryBuilder('role')
      .addSelect(
        `(SELECT COUNT(*) FROM "user_roles" "ur" WHERE "ur"."roleId" = role.id)`,
        'userCount',
      )
      .addSelect(
        `(SELECT COUNT(*) FROM "role_permissions" "rp" WHERE "rp"."roleId" = role.id)`,
        'permissionCount',
      );
  }

  private applyCounts(entities: RoleEntity[], raw: Record<string, unknown>[]) {
    return entities.map((entity, index) => {
      const counts = raw[index] ?? {};
      const roleWithCounts = entity as RoleEntity & {
        userCount: number;
        permissionCount: number;
      };

      roleWithCounts.userCount = Number(counts.userCount ?? 0);
      roleWithCounts.permissionCount = Number(counts.permissionCount ?? 0);

      return entity;
    });
  }
}
