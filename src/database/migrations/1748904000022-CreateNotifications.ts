import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotifications1748904000022 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id"              uuid          NOT NULL DEFAULT uuid_generate_v4(),
        "recipient_id"    uuid          NOT NULL,
        "triggered_by_id" uuid,
        "type"            varchar       NOT NULL,
        "title"           varchar       NOT NULL,
        "message"         text          NOT NULL,
        "entity_type"     varchar,
        "entity_id"       varchar,
        "redirect_url"    text,
        "is_read"         boolean       NOT NULL DEFAULT false,
        "read_at"         timestamp,
        "metadata"        jsonb,
        "created_at"      timestamp     NOT NULL DEFAULT now(),
        "updated_at"      timestamp     NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_recipient_read"
      ON "notifications" ("recipient_id", "is_read")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_recipient_created"
      ON "notifications" ("recipient_id", "created_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_notifications_recipient_created"`);
    await queryRunner.query(`DROP INDEX "IDX_notifications_recipient_read"`);
    await queryRunner.query(`DROP TABLE "notifications"`);
  }
}
