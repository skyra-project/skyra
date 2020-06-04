import { Pool } from 'pg';

export default async function main(PGSQL_DATABASE_OPTIONS: any) {
	const pgsql = new Pool(PGSQL_DATABASE_OPTIONS)
		.on('error', console.error);
	await pgsql.query(`ALTER TABLE moderation ADD COLUMN image_url VARCHAR(2000);`);
	await pgsql.end();
}

export const DEPRECATED = false;
