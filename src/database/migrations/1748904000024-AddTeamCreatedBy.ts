import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTeamCreatedBy1748904000024 implements MigrationInterface {
  name = 'AddTeamCreatedBy1748904000024';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "teams" ADD COLUMN "createdBy" uuid`);
    await queryRunner.query(
      `CREATE INDEX "IDX_teams_createdBy" ON "teams" ("createdBy")`,
    );
    await queryRunner.query(
      `ALTER TABLE "teams"
       ADD CONSTRAINT "FK_teams_createdBy"
       FOREIGN KEY ("createdBy") REFERENCES "users"("id")
       ON DELETE SET NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "teams" DROP CONSTRAINT "FK_teams_createdBy"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_teams_createdBy"`);
    await queryRunner.query(`ALTER TABLE "teams" DROP COLUMN "createdBy"`);
  }
}
