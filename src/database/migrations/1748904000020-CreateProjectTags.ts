import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProjectTags1748904000020 implements MigrationInterface {
  name = 'CreateProjectTags1748904000020';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "project_tags" (
        "id"         uuid         NOT NULL DEFAULT uuid_generate_v4(),
        "label"      varchar      NOT NULL,
        "color"      varchar      NOT NULL,
        "createdAt"  TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "updatedAt"  TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "deletedAt"  TIMESTAMPTZ,
        CONSTRAINT "PK_project_tags" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "project_tags"`);
  }
}
