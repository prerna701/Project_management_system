import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProjectClients1748904000016 implements MigrationInterface {
  name = 'CreateProjectClients1748904000016';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "project_clients" (
        "id"        uuid        NOT NULL DEFAULT uuid_generate_v4(),
        "projectId" uuid        NOT NULL,
        "userId"    uuid        NOT NULL,
        "role"      varchar     NOT NULL DEFAULT 'client',
        "addedBy"   uuid        NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_project_clients" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_project_clients_project_user" UNIQUE ("projectId", "userId"),
        CONSTRAINT "FK_project_clients_project" FOREIGN KEY ("projectId")
          REFERENCES "projects" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_project_clients_project" ON "project_clients" ("projectId")`);
    await queryRunner.query(`CREATE INDEX "IDX_project_clients_user"    ON "project_clients" ("userId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_project_clients_user"`);
    await queryRunner.query(`DROP INDEX "IDX_project_clients_project"`);
    await queryRunner.query(`DROP TABLE "project_clients"`);
  }
}
