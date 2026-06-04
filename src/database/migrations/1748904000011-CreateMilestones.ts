import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMilestones1748904000011 implements MigrationInterface {
  name = 'CreateMilestones1748904000011';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "milestones" (
        "id"                   uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "projectId"            uuid        NOT NULL,
        "name"                 varchar     NOT NULL,
        "description"          varchar,
        "startDate"            TIMESTAMPTZ,
        "dueDate"              TIMESTAMPTZ,
        "ownerId"              uuid,
        "status"               varchar     NOT NULL DEFAULT 'PLANNED',
        "completionPercentage" float       NOT NULL DEFAULT 0,
        "issues"               jsonb       NOT NULL DEFAULT '[]',
        "comments"             jsonb       NOT NULL DEFAULT '[]',
        "createdAt"            TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt"            TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deletedAt"            TIMESTAMPTZ,
        CONSTRAINT "PK_milestones" PRIMARY KEY ("id"),
        CONSTRAINT "FK_milestones_project" FOREIGN KEY ("projectId")
          REFERENCES "projects" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_milestones_project" ON "milestones" ("projectId")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_milestones_project"`);
    await queryRunner.query(`DROP TABLE "milestones"`);
  }
}
