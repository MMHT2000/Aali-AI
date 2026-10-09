import { MigrationInterface, QueryRunner } from 'typeorm';

export class SimulationRunState1791600000001 implements MigrationInterface {
  name = 'SimulationRunState1791600000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`simulation_run_state\` (
      \`id\` varchar(100) NOT NULL,
      \`state\` json NOT NULL,
      \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `simulation_run_state`');
  }
}
