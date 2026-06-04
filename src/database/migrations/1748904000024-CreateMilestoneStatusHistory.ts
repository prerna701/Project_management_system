import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMilestoneStatusHistory1748904000024 implements MigrationInterface {
  name = 'CreateMilestoneStatusHistory1748904000024';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "milestone_status_history" (
        "id"          uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "milestoneId" uuid        NOT NULL,
        "fromStatus"  varchar     NOT NULL,
        "toStatus"    varchar     NOT NULL,
        "changedBy"   uuid        NOT NULL,
        "note"        varchar,
        "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_milestone_status_history" PRIMARY KEY ("id"),
        CONSTRAINT "FK_milestone_status_history_milestone" FOREIGN KEY ("milestoneId")
          REFERENCES "milestones" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_milestone_status_history_milestone" ON "milestone_status_history" ("milestoneId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_milestone_status_history_milestone"`);
    await queryRunner.query(`DROP TABLE "milestone_status_history"`);
  }
}
