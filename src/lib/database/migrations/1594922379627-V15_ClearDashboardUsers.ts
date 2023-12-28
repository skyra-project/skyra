import { Table, TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V15ClearDashboardUsers1594922379627 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable('dashboard_user');
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		// Create the new dashboard_user table
		await queryRunner.createTable(
			new Table({
				name: 'dashboard_user',
				columns: [
					new TableColumn({ name: 'id', type: 'varchar', length: '19', isPrimary: true, isNullable: false, comment: 'ID of the user' }),
					new TableColumn({
						name: 'access_token',
						type: 'char',
						length: '30',
						isNullable: true,
						default: null,
						comment: 'Token to access the dasboard'
					}),
					new TableColumn({
						name: 'refresh_token',
						type: 'char',
						length: '30',
						isNullable: true,
						default: null,
						comment: 'Refresh token to refresh the access'
					}),
					new TableColumn({
						name: 'expires_at',
						type: 'timestamp without time zone',
						isNullable: true,
						default: null,
						comment: 'Expiry timestamp for the token'
					})
				]
			})
		);
	}
}
