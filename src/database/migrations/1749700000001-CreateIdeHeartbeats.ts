import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIdeHeartbeats1749700000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "ide_heartbeats" (
        "id"             UUID        NOT NULL DEFAULT uuid_generate_v4(),
        "taskSessionId"  UUID        NOT NULL,
        "timestamp"      TIMESTAMPTZ NOT NULL,
        "state"          VARCHAR     NOT NULL,
        "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ide_heartbeats" PRIMARY KEY ("id"),
        CONSTRAINT "FK_ide_heartbeats_session"
          FOREIGN KEY ("taskSessionId")
          REFERENCES "task_sessions" ("id")
          ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_ide_heartbeats_taskSessionId"
        ON "ide_heartbeats" ("taskSessionId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_ide_heartbeats_timestamp"
        ON "ide_heartbeats" ("timestamp")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "ide_heartbeats"`);
  }
}
