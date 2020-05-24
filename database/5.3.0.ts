/**
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
 * 	// eslint-disable-next-line @typescript-eslint/unbound-method
 * 	pgsql.on('error', console.error);
 * 	const dbconnection = await pgsql.connect();
 * 	await processQueries(pgsql);
 * 	dbconnection.release();
 * 	await pgsql.end();
 * }
 *
 * async function processQueries(pgsql: Pool) {
 * 	await pgsql.query(`
 * 		ALTER TABLE "guilds"
 * 		ADD COLUMN IF NOT EXISTS "roles.restricted-reaction" VARCHAR(19),
 * 		ADD COLUMN IF NOT EXISTS "roles.restricted-embed" VARCHAR(19),
 * 		ADD COLUMN IF NOT EXISTS "roles.restricted-attachment" VARCHAR(19),
 * 		ADD COLUMN IF NOT EXISTS "roles.restricted-voice" VARCHAR(19);
 * 	`);
 *
 * 	await pgsql.query(`
 * 		UPDATE moderation
 * 		SET
 * 			"type" = "type" & ${0b1110_1111}
 * 		WHERE
 * 			"type" & ${0b0011_0000} = ${0b0011_0000};
 * 	`);
 * }
 *
 * main().catch(error => console.error(error));
 */

export const DEPRECATED = true;
