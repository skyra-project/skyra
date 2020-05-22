import { Pool } from 'pg';
import { PGSQL_DATABASE_OPTIONS } from '../dist/config';
import type { RawGuildSettings } from '../src/lib/types/settings/raw/RawGuildSettings';
import type { CustomCommand } from '../src/lib/types/settings/GuildSettings';
import type { AnyObject } from '../src/lib/types/util';

async function main() {
	const pgsql = new Pool(PGSQL_DATABASE_OPTIONS)
		.on('error', console.error);
	const guilds = (await pgsql.query(`SELECT * FROM guilds;`)).rows as RawGuildSettings[];

	await Promise.all(guilds.map(guild => migrateGuild(pgsql, guild)));
	await pgsql.end();
}

async function migrateGuild(pgsql: Pool, data: RawGuildSettings) {
	const customCommands = (Reflect.get(data, 'tags') as [string, string][]).map((v): CustomCommand => ({
		id: v[0],
		content: v[1],
		embed: false,
		color: 0,
		args: []
	}));
	if (customCommands.length === 0) return;

	await pgsql.query(/* sql */`
		UPDATE guilds
		SET
			"custom-commands" = ARRAY[${cArrayJson(customCommands)}];
	`);
}

function cString(value: string) {
	const escaped = value.replace(/'/g, "''");
	return `'${escaped}'`;
}

function cArrayJson(value: AnyObject[]) {
	return `ARRAY[${value.map(json => cString(JSON.stringify(json)))}]::JSON[]`;
}

main().catch(error => console.error(error));

export const DEPRECATED = false;
