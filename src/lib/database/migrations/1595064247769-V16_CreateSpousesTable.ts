import { Table, TableColumn, TableForeignKey, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V16CreateSpousesTable1595064247769 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: 'user_spouses_user',
				columns: [
					new TableColumn({ name: 'user_id_1', type: 'varchar', length: '19', isNullable: false }),
					new TableColumn({ name: 'user_id_2', type: 'varchar', length: '19', isNullable: false })
				],
				foreignKeys: [
					new TableForeignKey({
						columnNames: ['user_id_1'],
						referencedTableName: 'user',
						referencedColumnNames: ['id'],
						onDelete: 'CASCADE'
					}),
					new TableForeignKey({
						columnNames: ['user_id_2'],
						referencedTableName: 'user',
						referencedColumnNames: ['id'],
						onDelete: 'CASCADE'
					})
				]
			})
		);

		await queryRunner.createPrimaryKey('user_spouses_user', ['user_id_1', 'user_id_2']);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable('user_spouses_user');
	}
}
