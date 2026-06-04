import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSubtaskComments1748904000026 implements MigrationInterface {
  name = 'CreateSubtaskComments1748904000026';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "subtask_comments" (
        "id"              uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "subtaskId"       uuid        NOT NULL,
        "parentCommentId" uuid,
        "userId"          uuid        NOT NULL,
        "content"         text        NOT NULL,
        "mentions"        jsonb       NOT NULL DEFAULT '[]',
        "attachments"     jsonb       NOT NULL DEFAULT '[]',
        "isEdited"        boolean     NOT NULL DEFAULT false,
        "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt"       TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deletedAt"       TIMESTAMPTZ,
        CONSTRAINT "PK_subtask_comments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_subtask_comments_subtask" FOREIGN KEY ("subtaskId")
          REFERENCES "subtasks" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_subtask_comments_subtaskId" ON "subtask_comments" ("subtaskId")`);
    await queryRunner.query(`CREATE INDEX "IDX_subtask_comments_userId" ON "subtask_comments" ("userId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_subtask_comments_userId"`);
    await queryRunner.query(`DROP INDEX "IDX_subtask_comments_subtaskId"`);
    await queryRunner.query(`DROP TABLE "subtask_comments"`);
  }
}
