---
to: src/database/seeds/relational/<%= h.inflection.dasherize(h.inflection.underscore(name)) %>/<%= h.inflection.dasherize(h.inflection.underscore(name)) %>-seed.service.ts
---
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { <%= h.inflection.camelize(h.inflection.singularize(name)) %>Entity } from '../../../../<%= h.inflection.dasherize(h.inflection.underscore(name)) %>/infrastructure/persistence/relational/entities/<%= h.inflection.dasherize(h.inflection.underscore(h.inflection.singularize(name))) %>.entity';

@Injectable()
export class <%= h.inflection.camelize(name) %>SeedService {
  constructor(
    @InjectRepository(<%= h.inflection.camelize(h.inflection.singularize(name)) %>Entity)
    private readonly repo: Repository<<%= h.inflection.camelize(h.inflection.singularize(name)) %>Entity>,
  ) {}

  async run(): Promise<void> {
    const items = [
      // TODO: add seed data here
      // { name: 'Example' },
    ];

    for (const item of items) {
      const existing = await this.repo.findOne({ where: item as any });
      if (!existing) {
        await this.repo.save(this.repo.create(item as any));
        console.log(`✅ Seeded: ${JSON.stringify(item)}`);
      } else {
        console.log(`⚪ Already exists: ${JSON.stringify(item)}`);
      }
    }
  }
}
