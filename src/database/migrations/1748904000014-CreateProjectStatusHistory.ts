import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProjectStatusHistory1748904000014 implements MigrationInterface {
  name = 'CreateProjectStatusHistory1748904000014';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "project_status_history" (
        "id"         uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "projectId"  uuid        NOT NULL,
        "fromStatus" varchar     NOT NULL,
        "toStatus"   varchar     NOT NULL,
        "changedBy"  uuid        NOT NULL,
        "note"       varchar,
        "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_project_status_history" PRIMARY KEY ("id"),
        CONSTRAINT "FK_project_status_history_project" FOREIGN KEY ("projectId")
          REFERENCES "projects" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_project_status_history_project" ON "project_status_history" ("projectId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_project_status_history_project"`);
    await queryRunner.query(`DROP TABLE "project_status_history"`);
  }
}
