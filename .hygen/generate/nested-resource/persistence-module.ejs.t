---
to: src/<%= h.inflection.dasherize(h.inflection.underscore(name)) %>/infrastructure/persistence/relational/relational-persistence.module.ts
---
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { <%= h.inflection.camelize(h.inflection.singularize(name)) %>Entity } from './entities/<%= h.inflection.dasherize(h.inflection.underscore(h.inflection.singularize(name))) %>.entity';
import { <%= h.inflection.camelize(name) %>Repository } from '../<%= h.inflection.dasherize(h.inflection.underscore(name)) %>.repository';
import { Relational<%= h.inflection.camelize(name) %>Repository } from './repositories/<%= h.inflection.dasherize(h.inflection.underscore(name)) %>.repository';

@Module({
  imports: [TypeOrmModule.forFeature([<%= h.inflection.camelize(h.inflection.singularize(name)) %>Entity])],
  providers: [
    { provide: <%= h.inflection.camelize(name) %>Repository, useClass: Relational<%= h.inflection.camelize(name) %>Repository },
  ],
  exports: [<%= h.inflection.camelize(name) %>Repository],
})
export class Relational<%= h.inflection.camelize(name) %>PersistenceModule {}
