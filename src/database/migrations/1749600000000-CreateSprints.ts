import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSprints1749600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "sprints" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "projectId" uuid NOT NULL,
        "name" varchar NOT NULL,
        "goal" text,
        "status" varchar NOT NULL DEFAULT 'PLANNED',
        "startDate" TIMESTAMPTZ,
        "endDate" TIMESTAMPTZ,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMPTZ,
        CONSTRAINT "PK_sprints" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_sprints_projectId" ON "sprints" ("projectId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_sprints_projectId"`);
    await queryRunner.query(`DROP TABLE "sprints"`);
  }
}
