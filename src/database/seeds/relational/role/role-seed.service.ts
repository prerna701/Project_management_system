import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from '../../../../roles/infrastructure/persistence/relational/entities/role.entity';

@Injectable()
export class RoleSeedService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
  ) {}

  async run(): Promise<void> {
    const roles = [
      { id: 1, name: 'Admin', slug: 'admin' },
      { id: 2, name: 'User', slug: 'user' },
      { id: 3, name: 'Manager', slug: 'manager' },
    ];

    for (const role of roles) {
      const existing = await this.roleRepo.findOne({ where: { id: role.id } });
      if (!existing) {
        await this.roleRepo.save(this.roleRepo.create(role));
        console.log(`✅ Seeded role: ${role.name}`);
      } else {
        console.log(`⚪ Role already exists: ${role.name}`);
      }
    }
  }
}
