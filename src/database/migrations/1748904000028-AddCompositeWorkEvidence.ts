import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompositeWorkEvidence1748904000028
  implements MigrationInterface
{
  name = 'AddCompositeWorkEvidence1748904000028';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "work_activity_events" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "projectId" uuid NOT NULL,
        "taskId" uuid,
        "timeLogId" uuid,
        "type" varchar NOT NULL,
        "occurredAt" TIMESTAMPTZ NOT NULL,
        "durationSeconds" integer NOT NULL DEFAULT 0,
        "metadata" jsonb NOT NULL DEFAULT '{}',
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_work_activity_events" PRIMARY KEY ("id"),
        CONSTRAINT "FK_work_activity_events_user" FOREIGN KEY ("userId")
          REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_work_activity_events_project" FOREIGN KEY ("projectId")
          REFERENCES "projects" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_work_activity_events_task" FOREIGN KEY ("taskId")
          REFERENCES "tasks" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_work_activity_events_time_log" FOREIGN KEY ("timeLogId")
          REFERENCES "task_time_logs" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_work_activity_time_log" ON "work_activity_events" ("timeLogId", "occurredAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_work_activity_task" ON "work_activity_events" ("taskId", "occurredAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_work_activity_user" ON "work_activity_events" ("userId", "occurredAt")`,
    );
    await queryRunner.query(`
      CREATE TABLE "evidence_provider_results" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "timeLogId" uuid NOT NULL,
        "provider" varchar NOT NULL,
        "score" integer NOT NULL,
        "weight" integer NOT NULL,
        "supportedMinutes" integer NOT NULL DEFAULT 0,
        "status" varchar NOT NULL DEFAULT 'READY',
        "details" jsonb NOT NULL DEFAULT '{}',
        "warnings" jsonb NOT NULL DEFAULT '[]',
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_evidence_provider_results" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_evidence_provider_time_log" UNIQUE ("timeLogId", "provider"),
        CONSTRAINT "FK_evidence_provider_time_log" FOREIGN KEY ("timeLogId")
          REFERENCES "task_time_logs" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "time_log_evidence_assessments" ADD "overallScore" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_log_evidence_assessments" ADD "activeMinutes" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_log_evidence_assessments" ADD "idleMinutes" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_log_evidence_assessments" ADD "taskActivityCount" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_log_evidence_assessments" ADD "hasOverlap" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_log_evidence_assessments" ADD "recommendation" varchar NOT NULL DEFAULT 'MANUAL_REVIEW'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "time_log_evidence_assessments" DROP COLUMN "recommendation"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_log_evidence_assessments" DROP COLUMN "hasOverlap"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_log_evidence_assessments" DROP COLUMN "taskActivityCount"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_log_evidence_assessments" DROP COLUMN "idleMinutes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_log_evidence_assessments" DROP COLUMN "activeMinutes"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_log_evidence_assessments" DROP COLUMN "overallScore"`,
    );
    await queryRunner.query(`DROP TABLE "evidence_provider_results"`);
    await queryRunner.query(`DROP INDEX "IDX_work_activity_user"`);
    await queryRunner.query(`DROP INDEX "IDX_work_activity_task"`);
    await queryRunner.query(`DROP INDEX "IDX_work_activity_time_log"`);
    await queryRunner.query(`DROP TABLE "work_activity_events"`);
  }
}
