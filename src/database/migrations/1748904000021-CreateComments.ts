import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateComments1748904000021 implements MigrationInterface {
  name = 'CreateComments1748904000021';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "comments" (
        "id"         uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "entityType" varchar     NOT NULL,
        "entityId"   uuid        NOT NULL,
        "authorId"   uuid        NOT NULL,
        "content"    text        NOT NULL,
        "isEdited"   boolean     NOT NULL DEFAULT false,
        "editedAt"   TIMESTAMPTZ,
        "mentions"   jsonb       NOT NULL DEFAULT '[]',
        "parentId"   uuid,
        "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deletedAt"  TIMESTAMPTZ,
        CONSTRAINT "PK_comments" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_comments_entity" ON "comments" ("entityType", "entityId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_comments_author" ON "comments" ("authorId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_comments_parent" ON "comments" ("parentId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_comments_parent"`);
    await queryRunner.query(`DROP INDEX "IDX_comments_author"`);
    await queryRunner.query(`DROP INDEX "IDX_comments_entity"`);
    await queryRunner.query(`DROP TABLE "comments"`);
  }
}
