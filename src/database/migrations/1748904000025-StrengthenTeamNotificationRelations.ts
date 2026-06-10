import { MigrationInterface, QueryRunner } from 'typeorm';

export class StrengthenTeamNotificationRelations1748904000025
  implements MigrationInterface
{
  name = 'StrengthenTeamNotificationRelations1748904000025';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "team_members" duplicate
      SET "isActive" = false, "leftAt" = COALESCE("leftAt", now())
      WHERE duplicate."isActive" = true
        AND EXISTS (
          SELECT 1
          FROM "team_members" keeper
          WHERE keeper."teamId" = duplicate."teamId"
            AND keeper."userId" = duplicate."userId"
            AND keeper."isActive" = true
            AND keeper."id" < duplicate."id"
        )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_team_members_active_team_user"
      ON "team_members" ("teamId", "userId")
      WHERE "isActive" = true
    `);

    await queryRunner.query(`
      ALTER TABLE "team_members"
      ADD CONSTRAINT "FK_team_members_user"
      FOREIGN KEY ("userId") REFERENCES "users"("id")
      ON DELETE CASCADE NOT VALID
    `);
    await queryRunner.query(`
      ALTER TABLE "team_members"
      ADD CONSTRAINT "FK_team_members_reporting_manager"
      FOREIGN KEY ("reportingManagerId") REFERENCES "users"("id")
      ON DELETE SET NULL NOT VALID
    `);
    await queryRunner.query(`
      ALTER TABLE "teams"
      ADD CONSTRAINT "FK_teams_team_lead"
      FOREIGN KEY ("teamLeadId") REFERENCES "users"("id")
      ON DELETE SET NULL NOT VALID
    `);
    await queryRunner.query(`
      ALTER TABLE "teams"
      ADD CONSTRAINT "FK_teams_created_by"
      FOREIGN KEY ("createdBy") REFERENCES "users"("id")
      ON DELETE SET NULL NOT VALID
    `);
    await queryRunner.query(`
      ALTER TABLE "notifications"
      ADD CONSTRAINT "FK_notifications_recipient"
      FOREIGN KEY ("recipient_id") REFERENCES "users"("id")
      ON DELETE CASCADE NOT VALID
    `);
    await queryRunner.query(`
      ALTER TABLE "notifications"
      ADD CONSTRAINT "FK_notifications_actor"
      FOREIGN KEY ("triggered_by_id") REFERENCES "users"("id")
      ON DELETE SET NULL NOT VALID
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT IF EXISTS "FK_notifications_actor"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT IF EXISTS "FK_notifications_recipient"`,
    );
    await queryRunner.query(
      `ALTER TABLE "teams" DROP CONSTRAINT IF EXISTS "FK_teams_created_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "teams" DROP CONSTRAINT IF EXISTS "FK_teams_team_lead"`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members" DROP CONSTRAINT IF EXISTS "FK_team_members_reporting_manager"`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_members" DROP CONSTRAINT IF EXISTS "FK_team_members_user"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "UQ_team_members_active_team_user"`,
    );
  }
}
