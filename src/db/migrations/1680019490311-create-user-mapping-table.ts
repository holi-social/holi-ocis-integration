import { MigrationInterface, QueryRunner } from 'typeorm'

export class createUserMappingTable1680019490311 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          CREATE TABLE user_mapping (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL UNIQUE,
            ocis_user_id VARCHAR(255) NOT NULL UNIQUE
          );
          CREATE INDEX user_mapping_user_id_idx ON user_mapping (user_id);
          CREATE INDEX user_mapping_ocis_user_id_idx ON user_mapping (ocis_user_id);
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE user_identity`)
  }
}
