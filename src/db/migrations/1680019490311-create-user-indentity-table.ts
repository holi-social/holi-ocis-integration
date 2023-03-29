import { MigrationInterface, QueryRunner } from 'typeorm'

export class createUserIndentityTable1680019490311 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          CREATE TABLE user_identity (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL UNIQUE,
            ocis_user_id VARCHAR(255) NOT NULL UNIQUE
          )
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE user_identity`)
  }
}
