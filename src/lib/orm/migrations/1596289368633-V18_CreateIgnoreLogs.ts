import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

const NEW_COLUMNS = ['channels.ignore.all', 'channels.ignore.message-edit', 'channels.ignore.message-delete', 'channels.ignore.reaction-add'];

export class V18CreateIgnoreLogs1596289368633 implements MigrationInterface {

	public async up(queryRunner: QueryRunner): Promise<void> {
		for (const column of NEW_COLUMNS) {
			await queryRunner.addColumn('guilds', new TableColumn({
				'name': column,
				'type': 'varchar',
				'length': '19',
				'isNullable': false,
				'isArray': true,
				'default': 'ARRAY[]::VARCHAR[]'
			}));
		}
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		for (const column of NEW_COLUMNS) {
			await queryRunner.dropColumn('guilds', column);
		}
	}

}
