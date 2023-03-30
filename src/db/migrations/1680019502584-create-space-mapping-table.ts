import { MigrationInterface, QueryRunner } from 'typeorm'

export class createSpaceMappingTable1680019502584 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          CREATE TABLE space_mapping (
            id SERIAL PRIMARY KEY,
            space_id VARCHAR(255) NOT NULL UNIQUE,
            ocis_space_id VARCHAR(255) NOT NULL UNIQUE
          );
          CREATE INDEX space_mapping_space_id_idx ON space_mapping (space_id);
          CREATE INDEX space_mapping_ocis_space_id_idx ON space_mapping (ocis_space_id);
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE space_identity`)
  }
}
