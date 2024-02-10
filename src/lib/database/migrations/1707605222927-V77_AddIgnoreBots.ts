import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V77AddIgnoreBots1707605222927 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'messages.ignore-bots', type: 'boolean', default: true }));
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropColumn('guilds', 'messages.ignore-bots');
	}
}
