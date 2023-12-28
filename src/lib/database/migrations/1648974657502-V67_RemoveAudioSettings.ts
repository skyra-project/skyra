import { hours } from '#utils/common';
import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V67RemoveAudioSettings1648974657502 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropColumn('guilds', 'music.allowed-roles');
		await queryRunner.dropColumn('guilds', 'music.allowed-voice-channels');
		await queryRunner.dropColumn('guilds', 'music.allow-streams');
		await queryRunner.dropColumn('guilds', 'music.auto-leave');
		await queryRunner.dropColumn('guilds', 'music.default-volume');
		await queryRunner.dropColumn('guilds', 'music.maximum-duration');
		await queryRunner.dropColumn('guilds', 'music.maximum-entries-per-user');

		await queryRunner.dropColumn('guilds', 'roles.dj');
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumn(
			'guilds',
			new TableColumn({ name: 'music.allowed-roles', type: 'varchar', length: '19', isArray: true, default: 'ARRAY[]::VARCHAR[]' })
		);
		await queryRunner.addColumn(
			'guilds',
			new TableColumn({ name: 'music.allowed-voice-channels', type: 'varchar', length: '19', isArray: true, default: 'ARRAY[]::VARCHAR[]' })
		);
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'music.allow-streams', type: 'boolean', default: true }));
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'music.auto-leave', type: 'boolean', default: true }));
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'music.default-volume', type: 'smallint', default: 100 }));
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'music.maximum-duration', type: 'integer', default: hours(2) }));
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'music.maximum-entries-per-user', type: 'smallint', default: 100 }));

		await queryRunner.addColumn(
			'guilds',
			new TableColumn({ name: 'roles.dj', type: 'varchar', length: '19', isArray: true, default: 'ARRAY[]::VARCHAR[]' })
		);
	}
}
