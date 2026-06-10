import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProjectCreatedBy1748904000023 implements MigrationInterface {
  name = 'AddProjectCreatedBy1748904000023';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "projects" ADD COLUMN "createdBy" uuid`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_projects_createdBy" ON "projects" ("createdBy")`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects"
       ADD CONSTRAINT "FK_projects_createdBy"
       FOREIGN KEY ("createdBy") REFERENCES "users"("id")
       ON DELETE SET NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT "FK_projects_createdBy"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_projects_createdBy"`);
    await queryRunner.query(
      `ALTER TABLE "projects" DROP COLUMN "createdBy"`,
    );
  }
}
