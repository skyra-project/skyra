import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V55MediaOnlyChannels1627318321333 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumn(
			'guilds',
			new TableColumn({
				name: 'channels.media-only',
				type: 'varchar',
				length: '19',
				isNullable: false,
				isArray: true,
				default: 'ARRAY[]::VARCHAR[]'
			})
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropColumn('guilds', 'channels.media-only');
	}
}
