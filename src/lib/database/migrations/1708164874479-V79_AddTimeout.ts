import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V79AddTimeout1708164874479 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'events.timeout', type: 'boolean', default: false }));
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropColumn('guilds', 'events.timeout');
	}
}
