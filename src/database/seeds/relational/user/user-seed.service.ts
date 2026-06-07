import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { RoleEntity } from '../../../../roles/infrastructure/persistence/relational/entities/role.entity';

@Injectable()
export class UserSeedService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
  ) {}

  async run(): Promise<void> {
    const adminRole = await this.roleRepo.findOne({ where: { id: 1 } });

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

    const existing = await this.userRepo.findOne({ where: { email: adminEmail } });
    if (!existing) {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      await this.userRepo.save(
        this.userRepo.create({
          email: adminEmail,
          firstName: 'Admin',
          lastName: 'User',
          password: hashedPassword,
          provider: 'email',
          status: 'ACTIVE',
          role: adminRole ?? undefined,
        }),
      );
    } else {
    }
  }
}
