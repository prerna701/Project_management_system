import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRolePermissions1748904000006 implements MigrationInterface {
  name = 'CreateRolePermissions1748904000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "role_permissions" (
        "id"           SERIAL  NOT NULL,
        "roleId"       integer NOT NULL,
        "permissionId" integer NOT NULL,
        CONSTRAINT "PK_role_permissions"            PRIMARY KEY ("id"),
        CONSTRAINT "FK_role_permissions_role"       FOREIGN KEY ("roleId")
          REFERENCES "roles" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_role_permissions_permission" FOREIGN KEY ("permissionId")
          REFERENCES "permissions" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_role_permissions_roleId_permissionId"
       ON "role_permissions" ("roleId", "permissionId")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_role_permissions_roleId_permissionId"`);
    await queryRunner.query(`DROP TABLE "role_permissions"`);
  }
}
