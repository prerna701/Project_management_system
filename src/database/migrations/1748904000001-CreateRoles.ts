import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRoles1748904000001 implements MigrationInterface {
  name = 'CreateRoles1748904000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id"   integer      NOT NULL,
        "name" varchar      NOT NULL,
        "slug" varchar,
        CONSTRAINT "PK_roles" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "roles"`);
  }
}
