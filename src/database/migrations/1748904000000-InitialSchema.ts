// Superseded — split into individual files from 1748904000000-EnableUuidExtension.ts onward.
import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchemaDeprecated1748904000000 implements MigrationInterface {
  name = 'InitialSchemaDeprecated1748904000000';
  public async up(_: QueryRunner): Promise<void> {}
  public async down(_: QueryRunner): Promise<void> {}
}
