import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBranchNameToTimeLogs1749700000003 implements MigrationInterface {
  name = 'AddBranchNameToTimeLogs1749700000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task_time_logs" ADD "branchName" varchar NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_log_evidence_assessments" ADD "branchName" varchar NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "time_log_evidence_assessments" DROP COLUMN "branchName"`,
    );
    await queryRunner.query(
      `ALTER TABLE "task_time_logs" DROP COLUMN "branchName"`,
    );
  }
}
