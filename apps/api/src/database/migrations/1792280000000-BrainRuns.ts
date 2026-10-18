import { MigrationInterface, QueryRunner } from 'typeorm';
export class BrainRuns1792280000000 implements MigrationInterface {
  name = 'BrainRuns1792280000000';
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE `brain_runs` (`id` varchar(36) NOT NULL, `area_id` varchar(40) NOT NULL, `mode` varchar(20) NOT NULL, `plan` json NOT NULL, `created_at` datetime NOT NULL, PRIMARY KEY (`id`), INDEX `idx_brain_area_mode_time` (`area_id`, `mode`, `created_at`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci');
  }
  async down(queryRunner: QueryRunner): Promise<void> { await queryRunner.query('DROP TABLE `brain_runs`'); }
}
