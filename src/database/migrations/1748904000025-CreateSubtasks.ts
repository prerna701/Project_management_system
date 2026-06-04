import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSubtasks1748904000025 implements MigrationInterface {
  name = 'CreateSubtasks1748904000025';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "subtasks" (
        "id"                   uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "projectId"            uuid        NOT NULL,
        "taskId"               uuid        NOT NULL,
        "title"                varchar     NOT NULL,
        "description"          text,
        "notes"                text,
        "assigneeId"           uuid,
        "ownerId"              uuid,
        "createdBy"            uuid,
        "priority"             varchar     NOT NULL DEFAULT 'MEDIUM',
        "status"               varchar     NOT NULL DEFAULT 'OPEN',
        "startDate"            TIMESTAMPTZ,
        "dueDate"              TIMESTAMPTZ,
        "workHours"            float,
        "loggedHours"          float       NOT NULL DEFAULT 0,
        "completionPercentage" float       NOT NULL DEFAULT 0,
        "isBillable"           boolean     NOT NULL DEFAULT false,
        "billingType"          varchar     NOT NULL DEFAULT 'NON_BILLABLE',
        "dependencies"         jsonb       NOT NULL DEFAULT '[]',
        "attachments"          jsonb       NOT NULL DEFAULT '[]',
        "labels"               jsonb       NOT NULL DEFAULT '[]',
        "checklist"            jsonb       NOT NULL DEFAULT '[]',
        "createdAt"            TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt"            TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deletedAt"            TIMESTAMPTZ,
        CONSTRAINT "PK_subtasks" PRIMARY KEY ("id"),
        CONSTRAINT "FK_subtasks_task" FOREIGN KEY ("taskId")
          REFERENCES "tasks" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_subtasks_project" FOREIGN KEY ("projectId")
          REFERENCES "projects" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_subtasks_taskId" ON "subtasks" ("taskId")`);
    await queryRunner.query(`CREATE INDEX "IDX_subtasks_projectId" ON "subtasks" ("projectId")`);
    await queryRunner.query(`CREATE INDEX "IDX_subtasks_assigneeId" ON "subtasks" ("assigneeId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_subtasks_assigneeId"`);
    await queryRunner.query(`DROP INDEX "IDX_subtasks_projectId"`);
    await queryRunner.query(`DROP INDEX "IDX_subtasks_taskId"`);
    await queryRunner.query(`DROP TABLE "subtasks"`);
  }
}
