import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTaskTimeLogs1748904000026 implements MigrationInterface {
  name = 'CreateTaskTimeLogs1748904000026';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "task_time_logs" (
        "id"                uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "taskId"            uuid        NOT NULL,
        "projectId"         uuid        NOT NULL,
        "userId"            uuid        NOT NULL,
        "startedAt"         TIMESTAMPTZ NOT NULL,
        "activeSince"       TIMESTAMPTZ,
        "pausedAt"          TIMESTAMPTZ,
        "endedAt"           TIMESTAMPTZ,
        "durationMinutes"   integer     NOT NULL DEFAULT 0,
        "description"       text,
        "workType"          varchar     NOT NULL DEFAULT 'DEVELOPMENT',
        "entryType"         varchar     NOT NULL,
        "timerState"        varchar     NOT NULL DEFAULT 'STOPPED',
        "status"            varchar     NOT NULL DEFAULT 'DRAFT',
        "isBillable"        boolean     NOT NULL DEFAULT false,
        "manualEntryReason" text,
        "reviewedById"      uuid,
        "reviewedAt"        TIMESTAMPTZ,
        "rejectionReason"   text,
        "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt"         TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deletedAt"         TIMESTAMPTZ,
        CONSTRAINT "PK_task_time_logs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_task_time_logs_task" FOREIGN KEY ("taskId")
          REFERENCES "tasks" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_task_time_logs_project" FOREIGN KEY ("projectId")
          REFERENCES "projects" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_task_time_logs_user" FOREIGN KEY ("userId")
          REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_task_time_logs_reviewer" FOREIGN KEY ("reviewedById")
          REFERENCES "users" ("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_task_time_logs_task" ON "task_time_logs" ("taskId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_task_time_logs_project" ON "task_time_logs" ("projectId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_task_time_logs_user" ON "task_time_logs" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_task_time_logs_status" ON "task_time_logs" ("status")`,
    );
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_task_time_logs_active_user"
      ON "task_time_logs" ("userId")
      WHERE "endedAt" IS NULL AND "deletedAt" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "UQ_task_time_logs_active_user"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_task_time_logs_status"`);
    await queryRunner.query(`DROP INDEX "IDX_task_time_logs_user"`);
    await queryRunner.query(`DROP INDEX "IDX_task_time_logs_project"`);
    await queryRunner.query(`DROP INDEX "IDX_task_time_logs_task"`);
    await queryRunner.query(`DROP TABLE "task_time_logs"`);
  }
}
