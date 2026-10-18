import { MigrationInterface, QueryRunner } from 'typeorm';
export class BrainControls1792290000000 implements MigrationInterface {
  name = 'BrainControls1792290000000';
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE `brain_controls` (`scope` varchar(40) NOT NULL, `paused` tinyint NOT NULL DEFAULT 0, `actor_id` varchar(36) NOT NULL, `reason` varchar(300) NOT NULL, `updated_at` datetime(3) NOT NULL, PRIMARY KEY (`scope`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci');
  }
  async down(queryRunner: QueryRunner): Promise<void> { await queryRunner.query('DROP TABLE `brain_controls`'); }
}
