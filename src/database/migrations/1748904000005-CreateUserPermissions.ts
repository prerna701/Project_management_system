import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserPermissions1748904000005 implements MigrationInterface {
  name = 'CreateUserPermissions1748904000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_permissions" (
        "id"           SERIAL  NOT NULL,
        "userId"       uuid    NOT NULL,
        "permissionId" integer NOT NULL,
        "resourceId"   varchar,
        "resourceType" varchar,
        CONSTRAINT "PK_user_permissions"            PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_permissions_user"       FOREIGN KEY ("userId")
          REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_user_permissions_permission" FOREIGN KEY ("permissionId")
          REFERENCES "permissions" ("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_permissions"`);
  }
}
