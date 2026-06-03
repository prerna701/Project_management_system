import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from '../../../../roles/infrastructure/persistence/relational/entities/role.entity';

const ROLES: Pick<RoleEntity, 'id' | 'name' | 'slug'>[] = [
  { id: 1, name: 'Admin', slug: 'admin' },
  { id: 2, name: 'User', slug: 'user' },
  { id: 3, name: 'Manager', slug: 'manager' },
  { id: 4, name: 'CEO', slug: 'ceo' },
  { id: 5, name: 'COO', slug: 'coo' },
  { id: 6, name: 'CIO', slug: 'cio' },
  { id: 7, name: 'CFO', slug: 'cfo' },
  { id: 8, name: 'CHRO', slug: 'chro' },
  { id: 9, name: 'Team Lead', slug: 'teamlead' },
  { id: 10, name: 'Developer', slug: 'developer' },
];

@Injectable()
export class RoleSeedService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
  ) {}

  async run(): Promise<void> {
    for (const role of ROLES) {
      const existing = await this.roleRepo.findOne({ where: { id: role.id } });

      if (!existing) {
        await this.roleRepo.save(this.roleRepo.create(role));
        console.log(`Seeded role: ${role.name}`);
        continue;
      }

      await this.roleRepo.update(role.id, {
        name: role.name,
        slug: role.slug,
      });
      console.log(`Role already exists, updated if needed: ${role.name}`);
    }

    await this.roleRepo.query(
      `SELECT setval(pg_get_serial_sequence('"roles"', 'id'), (SELECT MAX("id") FROM "roles"))`,
    );
  }
}
