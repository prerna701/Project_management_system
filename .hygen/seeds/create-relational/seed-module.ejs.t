---
to: src/database/seeds/relational/<%= h.inflection.dasherize(h.inflection.underscore(name)) %>/<%= h.inflection.dasherize(h.inflection.underscore(name)) %>-seed.module.ts
---
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from '../../../config/database.config';
import { TypeOrmConfigService } from '../../../typeorm-config.service';
import { <%= h.inflection.camelize(h.inflection.singularize(name)) %>Entity } from '../../../../<%= h.inflection.dasherize(h.inflection.underscore(name)) %>/infrastructure/persistence/relational/entities/<%= h.inflection.dasherize(h.inflection.underscore(h.inflection.singularize(name))) %>.entity';
import { <%= h.inflection.camelize(name) %>SeedService } from './<%= h.inflection.dasherize(h.inflection.underscore(name)) %>-seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [databaseConfig], envFilePath: ['.env'] }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    TypeOrmModule.forFeature([<%= h.inflection.camelize(h.inflection.singularize(name)) %>Entity]),
  ],
  providers: [<%= h.inflection.camelize(name) %>SeedService],
})
export class <%= h.inflection.camelize(name) %>SeedModule {}
