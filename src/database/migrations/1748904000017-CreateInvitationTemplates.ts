import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInvitationTemplates1748904000017 implements MigrationInterface {
  name = 'CreateInvitationTemplates1748904000017';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "invitation_templates" (
        "id"         uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "name"       varchar     NOT NULL,
        "userType"   varchar     NOT NULL,
        "subject"    varchar     NOT NULL,
        "content"    text        NOT NULL,
        "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deletedAt"  TIMESTAMPTZ,
        CONSTRAINT "PK_invitation_templates" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "invitation_templates"`);
  }
}
