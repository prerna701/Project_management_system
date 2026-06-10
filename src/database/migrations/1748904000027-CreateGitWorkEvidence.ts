import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGitWorkEvidence1748904000027
  implements MigrationInterface
{
  name = 'CreateGitWorkEvidence1748904000027';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "git_integrations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "provider" varchar NOT NULL DEFAULT 'GITHUB',
        "name" varchar NOT NULL,
        "apiBaseUrl" varchar,
        "tokenEnvKey" varchar NOT NULL DEFAULT 'GITHUB_TOKEN',
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_git_integrations" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "project_repositories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "integrationId" uuid NOT NULL,
        "projectId" uuid NOT NULL,
        "owner" varchar NOT NULL,
        "repository" varchar NOT NULL,
        "defaultBranch" varchar,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_project_repositories" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_project_repositories_project" UNIQUE ("projectId"),
        CONSTRAINT "FK_project_repositories_integration" FOREIGN KEY ("integrationId")
          REFERENCES "git_integrations" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_project_repositories_project" FOREIGN KEY ("projectId")
          REFERENCES "projects" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "user_git_identities" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "provider" varchar NOT NULL DEFAULT 'GITHUB',
        "username" varchar,
        "email" varchar,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_git_identities" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_git_identities_user" UNIQUE ("userId"),
        CONSTRAINT "FK_user_git_identities_user" FOREIGN KEY ("userId")
          REFERENCES "users" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "git_commit_activities" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "integrationId" uuid NOT NULL,
        "projectId" uuid NOT NULL,
        "userId" uuid,
        "sha" varchar NOT NULL,
        "authorEmail" varchar,
        "authorName" varchar,
        "committedAt" TIMESTAMPTZ NOT NULL,
        "message" text NOT NULL,
        "url" varchar,
        "filesChanged" integer NOT NULL DEFAULT 0,
        "additions" integer NOT NULL DEFAULT 0,
        "deletions" integer NOT NULL DEFAULT 0,
        "raw" jsonb,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_git_commit_activities" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_git_commit_activities_sha" UNIQUE ("integrationId", "sha"),
        CONSTRAINT "FK_git_commit_activities_integration" FOREIGN KEY ("integrationId")
          REFERENCES "git_integrations" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_git_commit_activities_project" FOREIGN KEY ("projectId")
          REFERENCES "projects" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_git_commit_activities_user" FOREIGN KEY ("userId")
          REFERENCES "users" ("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_git_commit_activities_project_time" ON "git_commit_activities" ("projectId", "committedAt")`,
    );
    await queryRunner.query(`
      CREATE TABLE "time_log_evidence_assessments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "timeLogId" uuid NOT NULL,
        "provider" varchar NOT NULL DEFAULT 'GITHUB',
        "status" varchar NOT NULL,
        "confidence" varchar NOT NULL,
        "loggedMinutes" integer NOT NULL,
        "gitWindowMinutes" integer NOT NULL DEFAULT 0,
        "gitEstimatedMinutes" integer NOT NULL DEFAULT 0,
        "commitCount" integer NOT NULL DEFAULT 0,
        "firstCommitAt" TIMESTAMPTZ,
        "lastCommitAt" TIMESTAMPTZ,
        "largestGapMinutes" integer NOT NULL DEFAULT 0,
        "filesChanged" integer NOT NULL DEFAULT 0,
        "additions" integer NOT NULL DEFAULT 0,
        "deletions" integer NOT NULL DEFAULT 0,
        "warnings" jsonb NOT NULL DEFAULT '[]',
        "commits" jsonb NOT NULL DEFAULT '[]',
        "assessedAt" TIMESTAMPTZ NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_time_log_evidence_assessments" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_time_log_evidence_time_log" UNIQUE ("timeLogId"),
        CONSTRAINT "FK_time_log_evidence_time_log" FOREIGN KEY ("timeLogId")
          REFERENCES "task_time_logs" ("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "time_log_evidence_assessments"`);
    await queryRunner.query(`DROP INDEX "IDX_git_commit_activities_project_time"`);
    await queryRunner.query(`DROP TABLE "git_commit_activities"`);
    await queryRunner.query(`DROP TABLE "user_git_identities"`);
    await queryRunner.query(`DROP TABLE "project_repositories"`);
    await queryRunner.query(`DROP TABLE "git_integrations"`);
  }
}
