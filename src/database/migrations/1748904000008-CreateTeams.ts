import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTeams1748904000008 implements MigrationInterface {
  name = 'CreateTeams1748904000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "teams" (
        "id"          uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "name"        varchar     NOT NULL,
        "description" varchar,
        "teamLeadId"  uuid,
        "department"  varchar,
        "isActive"    boolean     NOT NULL DEFAULT true,
        "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deletedAt"   TIMESTAMPTZ,
        CONSTRAINT "PK_teams" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "teams"`);
  }
}
