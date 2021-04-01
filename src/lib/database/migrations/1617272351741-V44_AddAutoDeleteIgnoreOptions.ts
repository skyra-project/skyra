import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class V44AddAutoDeleteIgnoreOptions1617272351741 implements MigrationInterface {
	private readonly names = [
		{ name: 'messages.auto-delete.ignored-roles', length: '19' },
		{ name: 'messages.auto-delete.ignored-channels', length: '19' },
		{ name: 'messages.auto-delete.ignored-commands', length: '32' }
	];

	public async up(queryRunner: QueryRunner): Promise<void> {
		for (const { name, length } of this.names) {
			const column = new TableColumn({ name, type: 'varchar', length, isNullable: false, isArray: true, default: 'ARRAY[]::VARCHAR[]' });
			await queryRunner.addColumn('guilds', column);
		}
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		for (const { name } of this.names) {
			await queryRunner.dropColumn('guilds', name);
		}
	}
}
