import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V78AddVoiceActivityLogging1707642380524 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumn(
			'guilds',
			new TableColumn({ name: 'channels.logs.voice-activity', type: 'varchar', length: '19', isNullable: true })
		);
		await queryRunner.addColumn(
			'guilds',
			new TableColumn({ name: 'channels.ignore.voice-activity', type: 'varchar', length: '19', isArray: true, default: 'ARRAY[]::VARCHAR[]' })
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropColumn('guilds', 'channels.logs.voice-activity');
		await queryRunner.dropColumn('guilds', 'channels.ignore.voice-activity');
	}
}
