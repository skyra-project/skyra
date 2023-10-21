import { TableColumn, type MigrationInterface, type QueryRunner } from 'typeorm';

const guildChangeTypeColumns = [
	['command-autodelete', 'text[]', 'text[]'],
	['custom-commands', 'text[]', 'text[]'],
	['disabledCommandsChannels', 'text[]', 'text[]'],
	['music.default-volume', 'smallint', 'double precision'],
	['music.maximum-duration', 'integer', 'double precision'],
	['music.maximum-entries-per-user', 'smallint', 'double precision'],
	['notifications.streams.twitch.streamers', 'text[]', 'text[]'],
	['permissions.roles', 'text[]', 'text[]'],
	['permissions.users', 'text[]', 'text[]'],
	['roles.auto', 'text[]', 'text[]'],
	['roles.reactions', 'text[]', 'text[]'],
	['roles.uniqueRoleSets', 'text[]', 'text[]'],
	['selfmod.invites.ignoredCodes', 'character varying[]', 'text[]'],
	['selfmod.links.softAction', 'smallint', 'integer'],
	['selfmod.links.thresholdMaximum', 'smallint', 'integer'],
	['selfmod.messages.hardAction', 'smallint', 'integer'],
	['selfmod.messages.maximum', 'smallint', 'integer'],
	['selfmod.messages.queue-size', 'smallint', 'integer'],
	['selfmod.messages.softAction', 'smallint', 'integer'],
	['selfmod.reactions.hardAction', 'smallint', 'integer'],
	['selfmod.reactions.maximum', 'smallint', 'integer'],
	['selfmod.reactions.softAction', 'smallint', 'integer'],
	['selfmod.reactions.thresholdMaximum', 'smallint', 'integer'],
	['social.multiplier', 'numeric(53)', 'double precision'],
	['stickyRoles', 'text[]', 'text[]'],
	['trigger.alias', 'text[]', 'text[]'],
	['trigger.includes', 'text[]', 'text[]']
] as const;

const guildChangeDefaultColumns = [
	['selfmod.capitals.ignoredChannels', 'ARRAY []::character varying[];', "'{}'::character varying[]"],
	['selfmod.capitals.ignoredRoles', 'ARRAY []::character varying[];', "'{}'::character varying[]"],
	['selfmod.filter.ignoredChannels', 'ARRAY []::character varying[];', "'{}'::character varying[]"],
	['selfmod.filter.ignoredRoles', 'ARRAY []::character varying[]', "'{}'::character varying[]"],
	['selfmod.invites.ignoredChannels', 'ARRAY []::character varying[]', "'{}'::character varying[]"],
	['selfmod.invites.ignoredCodes', 'ARRAY []::character varying[]', "'{}'::text[]"],
	['selfmod.invites.ignoredGuilds', 'ARRAY []::character varying[]', "'{}'::character varying[]"],
	['selfmod.invites.ignoredRoles', 'ARRAY []::character varying[]', "'{}'::character varying[]"],
	['selfmod.links.ignoredChannels', 'ARRAY []::character varying[]', "'{}'::character varying[]"],
	['selfmod.links.ignoredRoles', 'ARRAY []::character varying[]', "'{}'::character varying[]"],
	['selfmod.links.whitelist', 'ARRAY []::character varying[]', "'{}'::character varying[]"],
	['selfmod.messages.ignoredChannels', 'ARRAY []::character varying[]', "'{}'::character varying[]"],
	['selfmod.messages.ignoredRoles', 'ARRAY []::character varying[]', "'{}'::character varying[]"],
	['selfmod.newlines.ignoredRoles', 'ARRAY []::character varying[]', "'{}'::character varying[]"],
	['selfmod.newlines.ignoredRoles', 'ARRAY []::character varying[]', "'{}'::character varying[]"],
	['selfmod.reactions.whitelist', 'ARRAY []::character varying[]', "'{}'::character varying[]"]
];

export class V05MigrateGuilds1594583103788 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await this.migrateGuilds(queryRunner);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await Promise.all(
			guildChangeTypeColumns.map(([colName, , oldType]) =>
				queryRunner.query(/* sql */ `
					ALTER TABLE public.guilds
					ALTER COLUMN "${colName}"
					TYPE ${oldType};
				`)
			)
		);

		await Promise.all(
			guildChangeDefaultColumns.map(([colName, , oldDefault]) =>
				queryRunner.query(/* sql */ `
					ALTER TABLE public.guilds
					ALTER COLUMN "${colName}"
					SET DEFAULT ${oldDefault};
				`)
			)
		);

		await queryRunner.addColumn(
			'guilds',
			new TableColumn({ name: 'roles.staff', type: 'varchar', length: '19', isNullable: true, default: null, comment: 'Staff roles' })
		);
	}

	private async migrateGuilds(queryRunner: QueryRunner): Promise<void> {
		// Change the type of specified columns in the "guilds" table
		await Promise.all(
			guildChangeTypeColumns.map(([colName, newType]) =>
				queryRunner.query(/* sql */ `
					ALTER TABLE public.guilds
					ALTER COLUMN "${colName}"
					TYPE ${newType};
				`)
			)
		);

		// Change the default specified columns in the "guilds" table
		await Promise.all(
			guildChangeDefaultColumns.map(([colName, newDefault]) =>
				queryRunner.query(/* sql */ `
					ALTER TABLE public.guilds
					ALTER COLUMN "${colName}"
					SET DEFAULT ${newDefault};
				`)
			)
		);

		// Remove the "roles.staff" column
		await queryRunner.dropColumn('guilds', 'roles.staff');
	}
}
