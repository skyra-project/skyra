/**
 * import type { CustomCommand } from '@lib/types/settings/GuildSettings';
 * import type { RawGuildSettings } from '@lib/types/settings/raw/RawGuildSettings';
 * import type { AnyObject } from '@lib/types/util';
 * import { Pool, PoolClient } from 'pg';
 *
 * export default async function main(PGSQL_DATABASE_OPTIONS: any) {
 * 	const pgsql = new Pool(PGSQL_DATABASE_OPTIONS)
 * 		.on('error', console.error);
 * 	const guilds = (await pgsql.query(`SELECT * FROM guilds;`)).rows as RawGuildSettings[];
 * 	await pgsql.query(`ALTER TABLE guilds RENAME COLUMN "tags" TO "custom-commands";`);
 *
 * 	const connection = await pgsql.connect();
 * 	await connection.query('BEGIN;');
 * 	await Promise.all(guilds.map(guild => migrateGuild(connection, guild)));
 * 	await connection.query('COMMIT;');
 * 	connection.release();
 * 	await pgsql.end();
 * }
 *
 * async function migrateGuild(connection: PoolClient, guild: RawGuildSettings) {
 * 	const customCommands = (Reflect.get(guild, 'tags') as [string, string][]).map((v): CustomCommand => ({
 * 		id: v[0],
 * 		content: v[1],
 * 		embed: false,
 * 		color: 0,
 * 		args: []
 * 	}));
 * 	if (customCommands.length === 0) return;
 *
 * 	await connection.query(`
 * 		UPDATE guilds
 * 		SET "custom-commands" = ${cArrayJson(customCommands)}
 * 		WHERE id = ${cString(guild.id)};
 * 	`);
 * }
 *
 * function cString(value: string) {
 * 	const escaped = value.replace(/'/g, "''");
 * 	return `'${escaped}'`;
 * }
 *
 * function cArrayJson(value: AnyObject[]) {
 * 	return `ARRAY[${value.map(json => cString(JSON.stringify(json)))}]::JSON[]`;
 * }
 */

export const DEPRECATED = true;
