import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V62VersionSevenRemoveGuildSettings1646161749171 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropColumn('guilds', 'afk.role');
		await queryRunner.dropColumn('guilds', 'afk.prefix');
		await queryRunner.dropColumn('guilds', 'afk.prefix-force');

		await queryRunner.dropColumn('guilds', 'birthday.channel');
		await queryRunner.dropColumn('guilds', 'birthday.message');
		await queryRunner.dropColumn('guilds', 'birthday.role');

		await queryRunner.dropColumn('guilds', 'channels.announcements');
		await queryRunner.dropColumn('guilds', 'channels.greeting');
		await queryRunner.dropColumn('guilds', 'channels.farewell');
		await queryRunner.dropColumn('guilds', 'channels.spam');

		await queryRunner.dropColumn('guilds', 'messages.farewell');
		await queryRunner.dropColumn('guilds', 'messages.farewell-auto-delete');
		await queryRunner.dropColumn('guilds', 'messages.greeting');
		await queryRunner.dropColumn('guilds', 'messages.greeting-auto-delete');
		await queryRunner.dropColumn('guilds', 'messages.join-dm');
		await queryRunner.dropColumn('guilds', 'messages.announcement-embed');

		await queryRunner.dropColumn('guilds', 'roles.subscriber');

		await queryRunner.dropColumn('guilds', 'starboard.channel');
		await queryRunner.dropColumn('guilds', 'starboard.emoji');
		await queryRunner.dropColumn('guilds', 'starboard.ignored-channels');
		await queryRunner.dropColumn('guilds', 'starboard.minimum');
		await queryRunner.dropColumn('guilds', 'starboard.self-star');
		await queryRunner.dropColumn('guilds', 'starboard.maximum-age');
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'afk.role', type: 'varchar', length: '19', isNullable: true }));
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'afk.prefix', type: 'varchar', length: '32', isNullable: true }));
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'afk.prefix-force', type: 'boolean', default: false }));

		await queryRunner.addColumn('guilds', new TableColumn({ name: 'birthday.channel', type: 'varchar', length: '19', isNullable: true }));
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'birthday.message', type: 'varchar', length: '200', isNullable: true }));
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'birthday.role', type: 'varchar', length: '19', isNullable: true }));

		await queryRunner.addColumn('guilds', new TableColumn({ name: 'channels.announcements', type: 'varchar', length: '19', isNullable: true }));
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'channels.greeting', type: 'varchar', length: '19', isNullable: true }));
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'channels.farewell', type: 'varchar', length: '19', isNullable: true }));
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'channels.spam', type: 'varchar', length: '19', isNullable: true }));

		await queryRunner.addColumn('guilds', new TableColumn({ name: 'messages.farewell', type: 'varchar', length: '2000', isNullable: true }));
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'messages.farewell-auto-delete', type: 'bigint', isNullable: true }));
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'messages.greeting', type: 'varchar', length: '2000', isNullable: true }));
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'messages.greeting-auto-delete', type: 'bigint', isNullable: true }));
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'messages.join-dm', type: 'varchar', length: '1500', isNullable: true }));
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'messages.announcement-embed', type: 'boolean', default: false }));

		await queryRunner.addColumn('guilds', new TableColumn({ name: 'roles.subscriber', type: 'varchar', length: '19', isNullable: true }));

		await queryRunner.addColumn('guilds', new TableColumn({ name: 'starboard.channel', type: 'varchar', length: '19', isNullable: true }));
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'starboard.emoji', type: 'varchar', length: '75', default: '%E2%AD%90' }));
		await queryRunner.addColumn(
			'guilds',
			new TableColumn({ name: 'starboard.ignored-channels', type: 'varchar', length: '19', isArray: true, default: 'ARRAY[]::VARCHAR[]' })
		);
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'starboard.minimum', type: 'smallint', default: '1' }));
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'starboard.self-star', type: 'boolean', default: false }));
		await queryRunner.addColumn('guilds', new TableColumn({ name: 'starboard.maximum-age', type: 'bigint', isNullable: true }));
	}
}
