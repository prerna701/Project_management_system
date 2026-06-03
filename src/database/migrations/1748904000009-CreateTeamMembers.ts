import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTeamMembers1748904000009 implements MigrationInterface {
  name = 'CreateTeamMembers1748904000009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "team_members" (
        "id"                 uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "teamId"             uuid        NOT NULL,
        "userId"             uuid        NOT NULL,
        "teamRole"           varchar,
        "reportingManagerId" uuid,
        "joinedAt"           TIMESTAMPTZ,
        "leftAt"             TIMESTAMPTZ,
        "isActive"           boolean     NOT NULL DEFAULT true,
        CONSTRAINT "PK_team_members" PRIMARY KEY ("id"),
        CONSTRAINT "FK_team_members_team" FOREIGN KEY ("teamId")
          REFERENCES "teams" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_team_members_team_user" ON "team_members" ("teamId", "userId")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_team_members_team_user"`);
    await queryRunner.query(`DROP TABLE "team_members"`);
  }
}
