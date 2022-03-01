import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey, TableUnique } from 'typeorm';

export class V64VersionSevenRemoveSpouses1646163533583 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable('user_spouses_user');
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: 'user_spouses_user',
				columns: [
					new TableColumn({ name: 'user_id_1', type: 'varchar', length: '19', isPrimary: true }),
					new TableColumn({ name: 'user_id_2', type: 'varchar', length: '19', isPrimary: true })
				],
				foreignKeys: [
					new TableForeignKey({
						referencedTableName: 'user',
						referencedColumnNames: ['id'],
						columnNames: ['user_id_1'],
						onDelete: 'CASCADE'
					}),
					new TableForeignKey({
						referencedTableName: 'user',
						referencedColumnNames: ['id'],
						columnNames: ['user_id_2'],
						onDelete: 'CASCADE'
					})
				],
				uniques: [new TableUnique({ columnNames: ['user_id_1', 'user_id_2'] })]
			})
		);
	}
}
