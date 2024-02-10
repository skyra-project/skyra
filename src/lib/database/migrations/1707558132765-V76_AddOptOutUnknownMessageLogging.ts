import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V76AddOptOutUnknownMessageLogging1707558132765 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'events.unknown-messages', type: 'boolean', default: false }));
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropColumn('guilds', 'events.unknown-messages');
	}
}
