import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlignProjectsSchema1748904000019 implements MigrationInterface {
  name = 'AlignProjectsSchema1748904000019';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop clientName — redundant with project_clients join table
    await queryRunner.query(
      `ALTER TABLE "projects" DROP COLUMN IF EXISTS "clientName"`,
    );

    // Tags column stays jsonb — only the TypeScript type annotation changed,
    // no ALTER TABLE needed. Existing string-array values will remain until
    // overwritten by the application with the new {id, label, color} shape.
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "clientName" character varying`,
    );
  }
}
