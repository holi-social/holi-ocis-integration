import { MigrationInterface, QueryRunner } from 'typeorm'

export class createSpaceIndentityTable1680019502584 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          CREATE TABLE space_identity (
            id SERIAL PRIMARY KEY,
            space_id VARCHAR(255) NOT NULL UNIQUE,
            ocis_space_id VARCHAR(255) NOT NULL UNIQUE
          )
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE space_identity`)
  }
}
