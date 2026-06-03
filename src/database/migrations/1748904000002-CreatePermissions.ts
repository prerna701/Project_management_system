import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePermissions1748904000002 implements MigrationInterface {
  name = 'CreatePermissions1748904000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "permissions" (
        "id"     SERIAL  NOT NULL,
        "name"   varchar NOT NULL,
        "label"  varchar,
        "module" varchar,
        CONSTRAINT "UQ_permissions_name" UNIQUE ("name"),
        CONSTRAINT "PK_permissions"      PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "permissions"`);
  }
}
