import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V44AddAutoDeleteIgnoreOptions1617272351741 implements MigrationInterface {
	private readonly names = [
		new TableColumn({
			name: 'messages.auto-delete.ignored-all',
			type: 'boolean',
			isNullable: false,
			default: false
		}),
		new TableColumn({
			name: 'messages.auto-delete.ignored-roles',
			type: 'varchar',
			length: '19',
			isNullable: false,
			isArray: true,
			default: 'ARRAY[]::VARCHAR[]'
		}),
		new TableColumn({
			name: 'messages.auto-delete.ignored-channels',
			type: 'varchar',
			length: '19',
			isNullable: false,
			isArray: true,
			default: 'ARRAY[]::VARCHAR[]'
		}),
		new TableColumn({
			name: 'messages.auto-delete.ignored-commands',
			type: 'varchar',
			length: '32',
			isNullable: false,
			isArray: true,
			default: 'ARRAY[]::VARCHAR[]'
		})
	];

	public async up(queryRunner: QueryRunner): Promise<void> {
		for (const column of this.names) {
			await queryRunner.addColumn('guilds', column);
		}
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		for (const { name } of this.names) {
			await queryRunner.dropColumn('guilds', name);
		}
	}
}
