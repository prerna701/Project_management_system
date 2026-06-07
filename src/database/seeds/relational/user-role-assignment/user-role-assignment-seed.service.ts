import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { RoleEntity } from '../../../../roles/infrastructure/persistence/relational/entities/role.entity';
import { UserRoleEntity } from '../../../../users/infrastructure/persistence/relational/entities/user-role.entity';

@Injectable()
export class UserRoleAssignmentSeedService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepo: Repository<UserRoleEntity>,
  ) {}

  async run(): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';

    const adminUser = await this.userRepo.findOne({ where: { email: adminEmail } });
    if (!adminUser) {
      return;
    }

    const adminRole = await this.roleRepo.findOne({ where: { slug: 'admin' } });
    if (!adminRole) {
      return;
    }

    const existing = await this.userRoleRepo.findOne({
      where: { userId: adminUser.id, roleId: adminRole.id },
    });

    if (existing) {
      return;
    }

    await this.userRoleRepo.save(
      this.userRoleRepo.create({ userId: adminUser.id, roleId: adminRole.id }),
    );
  }
}
