import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnableUuidExtension1748904000000 implements MigrationInterface {
  name = 'EnableUuidExtension1748904000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // intentionally left blank — dropping uuid-ossp can break other things
  }
}
