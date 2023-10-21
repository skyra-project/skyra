import { Table, TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V70RemoveUserGameIntegration1662215154740 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable('user_game_integration');
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: 'user_game_integration',
				columns: [
					new TableColumn({ name: 'id', type: 'serial', isPrimary: true }),
					new TableColumn({ name: 'user_id', type: 'varchar', length: '19' }),
					new TableColumn({ name: 'game', type: 'varchar', length: '35' }),
					new TableColumn({ name: 'extra_data', type: 'jsonb' })
				],
				foreignKeys: [{ columnNames: ['user_id'], referencedTableName: 'user', referencedColumnNames: ['id'] }]
			})
		);
	}
}
