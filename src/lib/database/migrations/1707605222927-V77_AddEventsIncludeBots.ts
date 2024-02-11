import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V77AddEventsIncludeBots1707605222927 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'events.include-bots', type: 'boolean', default: false }));
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropColumn('guilds', 'events.include-bots');
	}
}
