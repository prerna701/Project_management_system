import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { RoleEntity } from '../../../../roles/infrastructure/persistence/relational/entities/role.entity';
import { UserRoleEntity } from '../../../../users/infrastructure/persistence/relational/entities/user-role.entity';

interface UserSeedAccount {
  email: string;
  firstName: string;
  lastName: string;
  roleSlug: string;
}

const USER_ACCOUNTS: UserSeedAccount[] = [
  { email: 'manager1@example.com', firstName: 'Manager', lastName: 'One', roleSlug: 'manager' },
  { email: 'manager2@example.com', firstName: 'Manager', lastName: 'Two', roleSlug: 'manager' },
  { email: 'teamlead1@example.com', firstName: 'Team', lastName: 'LeadOne', roleSlug: 'teamlead' },
  { email: 'teamlead2@example.com', firstName: 'Team', lastName: 'LeadTwo', roleSlug: 'teamlead' },
  { email: 'developer1@example.com', firstName: 'Developer', lastName: 'One', roleSlug: 'developer' },
  { email: 'developer2@example.com', firstName: 'Developer', lastName: 'Two', roleSlug: 'developer' },
  { email: 'developer3@example.com', firstName: 'Developer', lastName: 'Three', roleSlug: 'developer' },
];

@Injectable()
export class UserRoleAccountsSeedService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepo: Repository<UserRoleEntity>,
  ) {}

  async run(): Promise<void> {
    for (const account of USER_ACCOUNTS) {
      const role = await this.roleRepo.findOne({ where: { slug: account.roleSlug } });
      if (!role) {
        continue;
      }

      let user = await this.userRepo.findOne({ where: { email: account.email } });
      if (!user) {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash('Password@123', salt);

        user = await this.userRepo.save(
          this.userRepo.create({
            email: account.email,
            firstName: account.firstName,
            lastName: account.lastName,
            password: hashedPassword,
            provider: 'email',
            status: 'ACTIVE',
            role,
          }),
        );
      } else if (!user.role || user.role.id !== role.id) {
        await this.userRepo.save({
          ...user,
          role,
        });
      }

      const existingAssignment = await this.userRoleRepo.findOne({
        where: { userId: user.id, roleId: role.id },
      });
      if (!existingAssignment) {
        await this.userRoleRepo.save(
          this.userRoleRepo.create({
            userId: user.id,
            roleId: role.id,
          }),
        );
      }
    }
  }
}
