import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTasks1748904000012 implements MigrationInterface {
  name = 'CreateTasks1748904000012';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "tasks" (
        "id"              uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "projectId"       uuid        NOT NULL,
        "milestoneId"     uuid,
        "parentTaskId"    uuid,
        "teamId"          uuid,
        "title"           varchar     NOT NULL,
        "description"     varchar,
        "assigneeId"      uuid,
        "reporterId"      uuid,
        "ownerId"         uuid,
        "createdBy"       uuid,
        "priority"        varchar     NOT NULL DEFAULT 'MEDIUM',
        "status"          varchar     NOT NULL DEFAULT 'OPEN',
        "startDate"       TIMESTAMPTZ,
        "dueDate"         TIMESTAMPTZ,
        "actualEndDate"   TIMESTAMPTZ,
        "estimatedHours"  float,
        "workHours"       float,
        "loggedHours"     float       NOT NULL DEFAULT 0,
        "timeLogTotal"    float       NOT NULL DEFAULT 0,
        "completionPercentage" float   NOT NULL DEFAULT 0,
        "isBillable"      boolean     NOT NULL DEFAULT false,
        "billingType"     varchar     NOT NULL DEFAULT 'NON_BILLABLE',
        "dependencies"    jsonb       NOT NULL DEFAULT '[]',
        "attachments"     jsonb       NOT NULL DEFAULT '[]',
        "labels"          jsonb       NOT NULL DEFAULT '[]',
        "checklist"       jsonb       NOT NULL DEFAULT '[]',
        "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt"       TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deletedAt"       TIMESTAMPTZ,
        CONSTRAINT "PK_tasks" PRIMARY KEY ("id"),
        CONSTRAINT "FK_tasks_project" FOREIGN KEY ("projectId")
          REFERENCES "projects" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tasks_milestone" FOREIGN KEY ("milestoneId")
          REFERENCES "milestones" ("id") ON DELETE SET NULL,
        CONSTRAINT "FK_tasks_parent" FOREIGN KEY ("parentTaskId")
          REFERENCES "tasks" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_tasks_project"    ON "tasks" ("projectId")`);
    await queryRunner.query(`CREATE INDEX "IDX_tasks_milestone"  ON "tasks" ("milestoneId")`);
    await queryRunner.query(`CREATE INDEX "IDX_tasks_assignee"   ON "tasks" ("assigneeId")`);
    await queryRunner.query(`CREATE INDEX "IDX_tasks_team"       ON "tasks" ("teamId")`);
    await queryRunner.query(`CREATE INDEX "IDX_tasks_owner"      ON "tasks" ("ownerId")`);
    await queryRunner.query(`CREATE INDEX "IDX_tasks_parent"     ON "tasks" ("parentTaskId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_tasks_parent"`);
    await queryRunner.query(`DROP INDEX "IDX_tasks_owner"`);
    await queryRunner.query(`DROP INDEX "IDX_tasks_team"`);
    await queryRunner.query(`DROP INDEX "IDX_tasks_assignee"`);
    await queryRunner.query(`DROP INDEX "IDX_tasks_milestone"`);
    await queryRunner.query(`DROP INDEX "IDX_tasks_project"`);
    await queryRunner.query(`DROP TABLE "tasks"`);
  }
}
