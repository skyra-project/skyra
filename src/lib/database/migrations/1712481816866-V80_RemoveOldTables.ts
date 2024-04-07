import { Table, TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V80RemoveOldTables1712481816866 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable('client');

		// Remove old tables
		await queryRunner.dropTable('banner', true);
		await queryRunner.dropTable('giveaway', true);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: 'client',
				schema: 'public',
				columns: [
					new TableColumn({ name: 'id', type: 'varchar', length: '19', isPrimary: true, default: process.env.CLIENT_ID }),
					new TableColumn({
						name: 'user_blocklist',
						type: 'varchar',
						length: '19',
						isNullable: false,
						default: () => 'ARRAY[]::VARCHAR[]'
					}),
					new TableColumn({ name: 'user_boost', type: 'varchar', length: '19', isNullable: false, default: () => 'ARRAY[]::VARCHAR[]' }),
					new TableColumn({
						name: 'guild_blocklist',
						type: 'varchar',
						length: '19',
						isNullable: false,
						default: () => 'ARRAY[]::VARCHAR[]'
					}),
					new TableColumn({ name: 'guild_boost', type: 'varchar', length: '19', isNullable: false, default: () => 'ARRAY[]::VARCHAR[]' })
				]
			})
		);
	}
}
