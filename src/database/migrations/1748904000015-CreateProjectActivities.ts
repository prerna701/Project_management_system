import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProjectActivities1748904000015 implements MigrationInterface {
  name = 'CreateProjectActivities1748904000015';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "project_activities" (
        "id"          uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "projectId"   uuid        NOT NULL,
        "milestoneId" uuid,
        "taskId"      uuid,
        "subtaskId"   uuid,
        "actorId"     uuid        NOT NULL,
        "action"      varchar     NOT NULL,
        "entityType"  varchar     NOT NULL,
        "entityId"    uuid,
        "title"       varchar     NOT NULL,
        "description" varchar     NOT NULL,
        "oldValue"    varchar,
        "newValue"    varchar,
        "metadata"    jsonb       NOT NULL DEFAULT '{}',
        "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_project_activities" PRIMARY KEY ("id"),
        CONSTRAINT "FK_project_activities_project" FOREIGN KEY ("projectId")
          REFERENCES "projects" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_project_activities_project" ON "project_activities" ("projectId")`);
    await queryRunner.query(`CREATE INDEX "IDX_project_activities_milestone" ON "project_activities" ("milestoneId")`);
    await queryRunner.query(`CREATE INDEX "IDX_project_activities_task" ON "project_activities" ("taskId")`);
    await queryRunner.query(`CREATE INDEX "IDX_project_activities_subtask" ON "project_activities" ("subtaskId")`);
    await queryRunner.query(`CREATE INDEX "IDX_project_activities_actor"   ON "project_activities" ("actorId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_project_activities_actor"`);
    await queryRunner.query(`DROP INDEX "IDX_project_activities_subtask"`);
    await queryRunner.query(`DROP INDEX "IDX_project_activities_task"`);
    await queryRunner.query(`DROP INDEX "IDX_project_activities_milestone"`);
    await queryRunner.query(`DROP INDEX "IDX_project_activities_project"`);
    await queryRunner.query(`DROP TABLE "project_activities"`);
  }
}
