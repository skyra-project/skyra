import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V69RemoveTriggers1654346108374 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropColumn('guilds', 'trigger.alias');
		await queryRunner.dropColumn('guilds', 'trigger.includes');
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'trigger.alias', type: 'jsonb', default: "'[]'::JSONB" }));
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'trigger.includes', type: 'jsonb', default: "'[]'::JSONB" }));
	}
}
