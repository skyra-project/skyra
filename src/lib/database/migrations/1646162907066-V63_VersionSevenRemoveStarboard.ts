import { Table, TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V63VersionSevenRemoveStarboard1646162907066 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable('starboard');
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: 'starboard',
				columns: [
					new TableColumn({ name: 'enabled', type: 'boolean' }),
					new TableColumn({ name: 'user_id', type: 'varchar', length: '19' }),
					new TableColumn({ name: 'message_id', type: 'varchar', length: '19', isPrimary: true }),
					new TableColumn({ name: 'channel_id', type: 'varchar', length: '19' }),
					new TableColumn({ name: 'guild_id', type: 'varchar', length: '19', isPrimary: true }),
					new TableColumn({ name: 'star_message_id', type: 'varchar', length: '19', isNullable: true }),
					new TableColumn({ name: 'stars', type: 'integer' })
				]
			})
		);
	}
}
