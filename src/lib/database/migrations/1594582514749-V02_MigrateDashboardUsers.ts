import { Table, TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V02MigrateDashboardUsers1594582514749 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await this.migrateDashboardUsers(queryRunner);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable('dashboard_user');
	}

	private async migrateDashboardUsers(queryRunner: QueryRunner): Promise<void> {
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

		// Get the data from the "dashboard_users" table and transform it into DashboardUser entities
		const dashboardUserEntities = transformDashboardUsers(await queryRunner.query(/* sql */ `SELECT * FROM public.dashboard_users;`));

		// Save new DashboardUser entities to database
		const stringifiedData = JSON.stringify(dashboardUserEntities).replace(/'/g, "''");
		await queryRunner.query(/* sql */ `
			INSERT INTO public.dashboard_user
			SELECT * FROM json_populate_recordset(NULL::public.dashboard_user, '${stringifiedData}')
			ON CONFLICT DO NOTHING;
		`);
	}
}

function transformDashboardUsers(dUsers: DashboardUser[]): TransformedDashboardUser[] {
	return dUsers.map((user) => ({
		id: user.id,
		access_token: user.access_token,
		refresh_token: user.refresh_token,
		expires_at: new Date(Number(user.expires_at))
	}));
}

interface DashboardUser {
	id: string;
	access_token: string;
	refresh_token: string;
	expires_at: string;
}

interface TransformedDashboardUser extends Omit<DashboardUser, 'expires_at'> {
	expires_at: Date;
}
