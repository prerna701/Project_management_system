import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTaskComments1748904000018 implements MigrationInterface {
  name = 'CreateTaskComments1748904000018';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "task_comments" (
        "id"        uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "taskId"    uuid        NOT NULL,
        "parentCommentId" uuid,
        "userId"    uuid        NOT NULL,
        "content"   text        NOT NULL,
        "mentions"  jsonb       NOT NULL DEFAULT '[]',
        "attachments" jsonb     NOT NULL DEFAULT '[]',
        "isEdited"  boolean     NOT NULL DEFAULT false,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMPTZ,
        CONSTRAINT "PK_task_comments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_task_comments_task" FOREIGN KEY ("taskId")
          REFERENCES "tasks" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_task_comments_task" ON "task_comments" ("taskId")`);
    await queryRunner.query(`CREATE INDEX "IDX_task_comments_parent" ON "task_comments" ("parentCommentId")`);
    await queryRunner.query(`CREATE INDEX "IDX_task_comments_user" ON "task_comments" ("userId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_task_comments_user"`);
    await queryRunner.query(`DROP INDEX "IDX_task_comments_parent"`);
    await queryRunner.query(`DROP INDEX "IDX_task_comments_task"`);
    await queryRunner.query(`DROP TABLE "task_comments"`);
  }
}
