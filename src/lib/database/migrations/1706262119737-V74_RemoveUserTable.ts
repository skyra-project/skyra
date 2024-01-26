import { Table, TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V74RemoveUserTable1706262119737 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable('users');
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: 'users',
				columns: [new TableColumn({ name: 'id', type: 'varchar', length: '19', isPrimary: true })]
			})
		);
	}
}
