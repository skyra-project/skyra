/*
 * import { mergeDefault } from '@klasa/utils';
 * import { CLIENT_OPTIONS } from '@root/config';
 * import { Pool } from 'pg';
 *
 * async function main() {
 * 	const connection = mergeDefault({
 * 		host: 'localhost',
 * 		port: 5432,
 * 		database: 'klasa',
 * 		options: {
 * 			max: 20,
 * 			idleTimeoutMillis: 30000,
 * 			connectionTimeoutMillis: 2000
 * 		}
 * 	}, CLIENT_OPTIONS.providers!.postgres);
 * 	const pgsql = new Pool({
 * 		...connection.options,
 * 		host: connection.host,
 * 		port: connection.port,
 * 		user: connection.user,
 * 		password: connection.password,
 * 		database: connection.database
 * 	});
 * 	pgsql.on('error', console.error);
 * 	const dbconnection = await pgsql.connect();
 * 	await processQueries(pgsql);
 * 	dbconnection.release();
 * 	await pgsql.end();
 * }
 *
 * async function processQueries(pgsql: Pool) {
 * 	await pgsql.query(`
 * 		ALTER TABLE "users"
 * 		ADD COLUMN IF NOT EXISTS "dark_theme"    BOOLEAN DEFAULT FALSE NOT NULL,
 * 		ADD COLUMN IF NOT EXISTS "moderation_dm" BOOLEAN DEFAULT TRUE  NOT NULL;
 * 	`);
 *
 * 	await pgsql.query(`
 * 		ALTER TABLE "guilds"
 * 		DROP COLUMN IF EXISTS     "messages.warnings",
 * 		ADD  COLUMN IF NOT EXISTS "messages.moderation-dm"          BOOLEAN DEFAULT FALSE NOT NULL,
 * 		ADD  COLUMN IF NOT EXISTS "messages.moderator-name-display" BOOLEAN DEFAULT TRUE  NOT NULL;
 * 	`);
 * }
 *
 * main().catch(error => console.error(error));
*/

export const DEPRECATED = true;
