import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditLogs1748904000007 implements MigrationInterface {
  name = 'CreateAuditLogs1748904000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id"            uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "userId"        varchar,
        "userEmail"     varchar,
        "ipAddress"     varchar,
        "method"        varchar     NOT NULL,
        "url"           varchar     NOT NULL,
        "body"          jsonb,
        "params"        jsonb,
        "statusCode"    integer,
        "duration"      varchar,
        "description"   varchar,
        "module"        varchar,
        "entityName"    varchar,
        "impact"        varchar,
        "oldValues"     jsonb,
        "newValues"     jsonb,
        "changedFields" jsonb,
        "responseData"  jsonb,
        "errorMessage"  varchar,
        "isError"       boolean     NOT NULL DEFAULT false,
        "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "audit_logs"`);
  }
}
