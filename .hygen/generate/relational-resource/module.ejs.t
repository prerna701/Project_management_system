---
to: src/<%= h.inflection.dasherize(h.inflection.underscore(name)) %>/<%= h.inflection.dasherize(h.inflection.underscore(name)) %>.module.ts
---
import { Module } from '@nestjs/common';
import { <%= h.inflection.camelize(name) %>Controller } from './<%= h.inflection.dasherize(h.inflection.underscore(name)) %>.controller';
import { <%= h.inflection.camelize(name) %>Service } from './<%= h.inflection.dasherize(h.inflection.underscore(name)) %>.service';
import { Relational<%= h.inflection.camelize(name) %>PersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [Relational<%= h.inflection.camelize(name) %>PersistenceModule, AuditLogsModule],
  controllers: [<%= h.inflection.camelize(name) %>Controller],
  providers: [<%= h.inflection.camelize(name) %>Service],
  exports: [<%= h.inflection.camelize(name) %>Service, Relational<%= h.inflection.camelize(name) %>PersistenceModule],
})
export class <%= h.inflection.camelize(name) %>Module {}
