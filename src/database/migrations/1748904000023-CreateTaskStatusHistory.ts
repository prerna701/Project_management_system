import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTaskStatusHistory1748904000023 implements MigrationInterface {
  name = 'CreateTaskStatusHistory1748904000023';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "task_status_history" (
        "id"         uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "taskId"     uuid        NOT NULL,
        "fromStatus" varchar     NOT NULL,
        "toStatus"   varchar     NOT NULL,
        "changedBy"  uuid        NOT NULL,
        "note"       varchar,
        "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_task_status_history" PRIMARY KEY ("id"),
        CONSTRAINT "FK_task_status_history_task" FOREIGN KEY ("taskId")
          REFERENCES "tasks" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_task_status_history_task" ON "task_status_history" ("taskId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_task_status_history_task"`);
    await queryRunner.query(`DROP TABLE "task_status_history"`);
  }
}
