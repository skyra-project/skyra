import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

const NEW_COLUMNS = ['channels.ignore.all', 'channels.ignore.message-edit', 'channels.ignore.message-delete', 'channels.ignore.reaction-add'];

export class V18CreateIgnoreLogs1596289368633 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await Promise.all(
			NEW_COLUMNS.map((colName) =>
				queryRunner.addColumn(
					'guilds',
					new TableColumn({
						name: colName,
						type: 'varchar',
						length: '19',
						isNullable: false,
						isArray: true,
						default: 'ARRAY[]::VARCHAR[]'
					})
				)
			)
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await Promise.all(NEW_COLUMNS.map((colName) => queryRunner.dropColumn('guilds', colName)));
	}
}
