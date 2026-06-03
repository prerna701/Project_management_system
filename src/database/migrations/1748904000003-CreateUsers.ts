import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1748904000003 implements MigrationInterface {
  name = 'CreateUsers1748904000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id"           uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "email"        varchar              UNIQUE,
        "password"     varchar,
        "provider"     varchar     NOT NULL DEFAULT 'email',
        "socialId"     varchar,
        "firstName"    varchar,
        "lastName"     varchar,
        "status"       varchar     NOT NULL DEFAULT 'PENDING',
        "roleId"       integer,
        "otp"          varchar,
        "otpExpiresAt" TIMESTAMPTZ,
        "lastLoginAt"  TIMESTAMPTZ,
        "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deletedAt"    TIMESTAMPTZ,
        CONSTRAINT "PK_users"      PRIMARY KEY ("id"),
        CONSTRAINT "FK_users_role" FOREIGN KEY ("roleId")
          REFERENCES "roles" ("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_users_email" ON "users" ("email")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_users_email"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
