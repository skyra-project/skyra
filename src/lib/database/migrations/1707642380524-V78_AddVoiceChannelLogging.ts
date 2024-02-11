import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V76AddVoiceChannelLogging1707642380524 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumn(
			'guilds',
			new TableColumn({ name: 'channels.logs.voice-channel', type: 'varchar', length: '19', isNullable: true })
		);
		await queryRunner.addColumn(
			'guilds',
			new TableColumn({ name: 'channels.ignore.voice-channel', type: 'varchar', length: '19', isArray: true, default: 'ARRAY[]::VARCHAR[]' })
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropColumn('guilds', 'channels.logs.voice-channel');
		await queryRunner.dropColumn('guilds', 'channels.ignore.voice-channel');
	}
}
