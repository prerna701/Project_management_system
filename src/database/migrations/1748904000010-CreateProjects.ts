import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProjects1748904000010 implements MigrationInterface {
  name = 'CreateProjects1748904000010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "projects" (
        "id"               uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "name"             varchar     NOT NULL,
        "code"             varchar,
        "description"      varchar,
        "clientName"       varchar,
        "startDate"        TIMESTAMPTZ,
        "endDate"          TIMESTAMPTZ,
        "priority"         varchar     NOT NULL DEFAULT 'FOUNDATION',
        "visibility"       varchar     NOT NULL DEFAULT 'PRIVATE',
        "status"           varchar     NOT NULL DEFAULT 'PLANNING',
        "isBillable"       boolean     NOT NULL DEFAULT false,
        "estimatedHours"   float,
        "budget"           float,
        "assignedTeamId"   uuid,
        "projectManagerId" uuid,
        "tags"             jsonb       NOT NULL DEFAULT '[]',
        "attachments"      jsonb       NOT NULL DEFAULT '[]',
        "createdAt"        TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt"        TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deletedAt"        TIMESTAMPTZ,
        CONSTRAINT "PK_projects" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "projects"`);
  }
}
