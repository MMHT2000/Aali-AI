import { MigrationInterface, QueryRunner } from 'typeorm';

export class ResidentAccounts1791600000000 implements MigrationInterface {
  name = 'ResidentAccounts1791600000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS resident_accounts (
        id varchar(36) NOT NULL,
        nid_hash char(64) NOT NULL,
        nid_last4 char(4) NOT NULL,
        display_name varchar(150) NOT NULL,
        phone_redacted varchar(20) NOT NULL,
        created_at datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        UNIQUE KEY UQ_resident_accounts_nid_hash (nid_hash)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS resident_accounts');
  }
}
