---
to: src/<%= h.inflection.dasherize(h.inflection.underscore(name)) %>/infrastructure/persistence/relational/entities/<%= h.inflection.dasherize(h.inflection.underscore(h.inflection.singularize(name))) %>.entity.ts
---
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: '<%= h.inflection.underscore(name) %>' })
@Index(['<%= h.inflection.camelize(h.inflection.singularize(parent), true) %>Id'])
export class <%= h.inflection.camelize(h.inflection.singularize(name)) %>Entity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  <%= h.inflection.camelize(h.inflection.singularize(parent), true) %>Id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
