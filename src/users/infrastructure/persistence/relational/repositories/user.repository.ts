import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { UserRoleEntity } from '../entities/user-role.entity';
import { UserPermissionEntity } from '../entities/user-permission.entity';
import { RolePermissionEntity } from '../entities/role-permission.entity';
import { UserRepository } from '../../user.repository';
import { User } from '../../../../domain/user';
import { UserMapper } from '../mappers/user.mapper';
import { NullableType } from '../../../../../common/types/nullable.type';
import { IPaginationOptions } from '../../../../../common/types/pagination-options';
import { PaginationMetaDto } from '../../../../../common/dto/pagination-response.dto';

@Injectable()
export class RelationalUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepo: Repository<UserRoleEntity>,
    @InjectRepository(UserPermissionEntity)
    private readonly userPermRepo: Repository<UserPermissionEntity>,
    @InjectRepository(RolePermissionEntity)
    private readonly rolePermRepo: Repository<RolePermissionEntity>,
  ) {}

  async create(user: Partial<User>): Promise<User> {
    const entity = this.userRepo.create(user as any);
    const saved = await this.userRepo.save(entity) as unknown as UserEntity;
    return UserMapper.toDomain(saved);
  }

  async findById(id: string, withRelations = false): Promise<NullableType<User>> {
    const entity = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.userRoles', 'userRole')
      .leftJoinAndSelect('userRole.role', 'userRoleRole')
      .where('user.id = :id', { id })
      .getOne();
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<NullableType<User>> {
    const entity = await this.userRepo.findOne({ where: { email } });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<User[]> {
    const entities = await this.userRepo.find({ relations: ['role'] });
    return entities.map(UserMapper.toDomain);
  }

  async findManyWithPagination(options: {
    paginationOptions: IPaginationOptions;
    search?: string;
  }): Promise<{ items: User[]; meta: PaginationMetaDto }> {
    const { paginationOptions, search } = options;
    const query = this.userRepo.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.userRoles', 'userRole')
      .leftJoinAndSelect('userRole.role', 'userRoleRole')
      .withDeleted()
      .andWhere('user.deletedAt IS NULL');

    if (search) {
      query.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const totalItems = await query.getCount();
    const { page, limit } = paginationOptions;

    const entities = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getMany();

    const totalPages = Math.ceil(totalItems / limit);

    const meta: PaginationMetaDto = {
      currentPage: page,
      limit,
      totalItems,
      totalPages,
    };

    return { items: entities.map(UserMapper.toDomain), meta };
  }

  async update(id: string, payload: Partial<User>): Promise<NullableType<User>> {
    await this.userRepo.save({ id, ...payload });
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.userRepo.softDelete(id);
  }

  async getUserRoles(userId: string): Promise<any[]> {
    const userRoles = await this.userRoleRepo.find({
      where: { userId },
      relations: ['role'],
    });
    return userRoles.map((ur) => ur.role);
  }

  async getUserPermissions(userId: string, roleIds?: number[]): Promise<any[]> {
    const directPerms = await this.userPermRepo.find({
      where: { userId },
      relations: ['permission'],
    });

    const rolePerms: any[] = [];
    if (roleIds && roleIds.length > 0) {
      for (const roleId of roleIds) {
        const rp = await this.rolePermRepo.find({
          where: { roleId },
          relations: ['permission'],
        });
        rolePerms.push(...rp.map((r) => r.permission));
      }
    }

    const allPerms = [...directPerms.map((dp) => dp.permission), ...rolePerms];
    const unique = allPerms.filter(
      (p, i, arr) => arr.findIndex((q) => q.id === p.id) === i,
    );
    return unique;
  }

  async assignRole(userId: string, roleId: number): Promise<void> {
    const existing = await this.userRoleRepo.findOne({ where: { userId, roleId } });
    if (!existing) {
      await this.userRoleRepo.save({ userId, roleId });
    }
  }

  async removeRole(userId: string, roleId: number): Promise<void> {
    await this.userRoleRepo.delete({ userId, roleId });
  }

  async assignPermission(
    userId: string,
    permissionId: number,
    resourceId?: string,
    resourceType?: string,
  ): Promise<void> {
    const existing = await this.userPermRepo.findOne({ where: { userId, permissionId } });
    if (!existing) {
      await this.userPermRepo.save({ userId, permissionId, resourceId, resourceType });
    }
  }

  async removePermission(userId: string, permissionId: number): Promise<void> {
    await this.userPermRepo.delete({ userId, permissionId });
  }
}
