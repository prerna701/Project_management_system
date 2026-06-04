import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProjectComments1748904000013 implements MigrationInterface {
  name = 'CreateProjectComments1748904000013';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "project_comments" (
        "id"        uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "projectId" uuid        NOT NULL,
        "milestoneId" uuid,
        "parentCommentId" uuid,
        "userId"    uuid        NOT NULL,
        "content"   text        NOT NULL,
        "mentions"  jsonb       NOT NULL DEFAULT '[]',
        "attachments" jsonb     NOT NULL DEFAULT '[]',
        "isEdited"  boolean     NOT NULL DEFAULT false,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMPTZ,
        CONSTRAINT "PK_project_comments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_project_comments_project" FOREIGN KEY ("projectId")
          REFERENCES "projects" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_project_comments_project" ON "project_comments" ("projectId")`);
    await queryRunner.query(`CREATE INDEX "IDX_project_comments_milestone" ON "project_comments" ("milestoneId")`);
    await queryRunner.query(`CREATE INDEX "IDX_project_comments_parent" ON "project_comments" ("parentCommentId")`);
    await queryRunner.query(`CREATE INDEX "IDX_project_comments_user"    ON "project_comments" ("userId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_project_comments_user"`);
    await queryRunner.query(`DROP INDEX "IDX_project_comments_parent"`);
    await queryRunner.query(`DROP INDEX "IDX_project_comments_milestone"`);
    await queryRunner.query(`DROP INDEX "IDX_project_comments_project"`);
    await queryRunner.query(`DROP TABLE "project_comments"`);
  }
}
