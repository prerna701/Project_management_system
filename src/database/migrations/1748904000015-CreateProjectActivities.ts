import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProjectActivities1748904000015 implements MigrationInterface {
  name = 'CreateProjectActivities1748904000015';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "project_activities" (
        "id"          uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "projectId"   uuid        NOT NULL,
        "actorId"     uuid        NOT NULL,
        "action"      varchar     NOT NULL,
        "entityType"  varchar     NOT NULL,
        "entityId"    uuid,
        "description" varchar     NOT NULL,
        "metadata"    jsonb       NOT NULL DEFAULT '{}',
        "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_project_activities" PRIMARY KEY ("id"),
        CONSTRAINT "FK_project_activities_project" FOREIGN KEY ("projectId")
          REFERENCES "projects" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_project_activities_project" ON "project_activities" ("projectId")`);
    await queryRunner.query(`CREATE INDEX "IDX_project_activities_actor"   ON "project_activities" ("actorId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_project_activities_actor"`);
    await queryRunner.query(`DROP INDEX "IDX_project_activities_project"`);
    await queryRunner.query(`DROP TABLE "project_activities"`);
  }
}
