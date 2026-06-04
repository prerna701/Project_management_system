import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIssues1748904000021 implements MigrationInterface {
  name = 'CreateIssues1748904000021';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "issues" (
        "id"           uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "projectId"    uuid        NOT NULL,
        "milestoneId"  uuid,
        "taskId"       uuid,
        "subtaskId"    uuid,
        "title"        varchar     NOT NULL,
        "description"  text,
        "status"       varchar     NOT NULL DEFAULT 'OPEN',
        "raisedBy"     uuid        NOT NULL,
        "assignedToId" uuid,
        "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_issues" PRIMARY KEY ("id"),
        CONSTRAINT "FK_issues_project" FOREIGN KEY ("projectId")
          REFERENCES "projects" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_issues_project"     ON "issues" ("projectId")`);
    await queryRunner.query(`CREATE INDEX "IDX_issues_milestone"   ON "issues" ("milestoneId")`);
    await queryRunner.query(`CREATE INDEX "IDX_issues_task"        ON "issues" ("taskId")`);
    await queryRunner.query(`CREATE INDEX "IDX_issues_assigned_to" ON "issues" ("assignedToId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_issues_assigned_to"`);
    await queryRunner.query(`DROP INDEX "IDX_issues_task"`);
    await queryRunner.query(`DROP INDEX "IDX_issues_milestone"`);
    await queryRunner.query(`DROP INDEX "IDX_issues_project"`);
    await queryRunner.query(`DROP TABLE "issues"`);
  }
}
