import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

export class V47AddNewLogsChannels1617645345960 implements MigrationInterface {
	private readonly names: readonly string[] = [
		'channels.logs.role-create',
		'channels.logs.role-update',
		'channels.logs.role-delete',
		'channels.logs.channel-create',
		'channels.logs.channel-update',
		'channels.logs.channel-delete',
		'channels.logs.emoji-create',
		'channels.logs.emoji-update',
		'channels.logs.emoji-delete',
		'channels.logs.server-update'
	];

	private readonly replaces: readonly [string, string][] = [
		['channels.member-logs', 'channels.logs.member'],
		['channels.message-logs', 'channels.logs.message'],
		['channels.moderation-logs', 'channels.logs.moderation'],
		['channels.nsfw-message-logs', 'channels.logs.nsfw-message'],
		['channels.image-logs', 'channels.logs.image'],
		['channels.prune-logs', 'channels.logs.prune'],
		['channels.reaction-logs', 'channels.logs.reaction']
	];

	public async up(queryRunner: QueryRunner): Promise<void> {
		for (const name of this.names) {
			const column = new TableColumn({ name, type: 'varchar', length: '19', isNullable: true });
			await queryRunner.addColumn('guilds', column);
		}

		for (const [previous, next] of this.replaces) {
			await queryRunner.renameColumn('guilds', previous, next);
		}
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		for (const name of this.names) {
			await queryRunner.dropColumn('guilds', name);
		}

		for (const [next, previous] of this.replaces) {
			await queryRunner.renameColumn('guilds', previous, next);
		}
	}
}
