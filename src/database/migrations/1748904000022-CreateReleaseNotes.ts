import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReleaseNotes1748904000022 implements MigrationInterface {
  name = 'CreateReleaseNotes1748904000022';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "release_notes" (
        "id"          uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "projectId"   uuid        NOT NULL,
        "title"       varchar     NOT NULL,
        "version"     varchar     NOT NULL,
        "description" text,
        "items"       jsonb       NOT NULL DEFAULT '[]',
        "releasedAt"  TIMESTAMPTZ,
        "createdBy"   uuid        NOT NULL,
        "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_release_notes" PRIMARY KEY ("id"),
        CONSTRAINT "FK_release_notes_project" FOREIGN KEY ("projectId")
          REFERENCES "projects" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_release_notes_project" ON "release_notes" ("projectId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_release_notes_project"`);
    await queryRunner.query(`DROP TABLE "release_notes"`);
  }
}
