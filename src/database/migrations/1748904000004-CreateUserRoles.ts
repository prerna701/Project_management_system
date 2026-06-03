import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserRoles1748904000004 implements MigrationInterface {
  name = 'CreateUserRoles1748904000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_roles" (
        "id"     SERIAL  NOT NULL,
        "userId" uuid    NOT NULL,
        "roleId" integer NOT NULL,
        CONSTRAINT "PK_user_roles"      PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_roles_user" FOREIGN KEY ("userId")
          REFERENCES "users" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_user_roles_role" FOREIGN KEY ("roleId")
          REFERENCES "roles" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_user_roles_userId_roleId"
       ON "user_roles" ("userId", "roleId")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_user_roles_userId_roleId"`);
    await queryRunner.query(`DROP TABLE "user_roles"`);
  }
}
