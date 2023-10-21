import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V41AddMusicAllowedVoiceChannelsAndRoles1616191193015 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumn(
			'guilds',
			new TableColumn({
				name: 'music.allowed-voice-channels',
				type: 'varchar',
				isArray: true,
				length: '19',
				default: 'ARRAY[]::VARCHAR[]'
			})
		);

		await queryRunner.addColumn(
			'guilds',
			new TableColumn({
				name: 'music.allowed-roles',
				type: 'varchar',
				isArray: true,
				length: '19',
				default: 'ARRAY[]::VARCHAR[]'
			})
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropColumn('guilds', 'music.allowed-voice-channels');
		await queryRunner.dropColumn('guilds', 'music.allowed-roles');
	}
}
