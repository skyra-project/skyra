// Config must be the first to be loaded, as it sets the env:
import '#root/config';

// Import everything else:
import { envParseBoolean, envParseInteger, envParseString } from '@skyra/env-utilities';
import { fileURLToPath } from 'node:url';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export const AppDataConfig = new DataSource({
	type: 'postgres',
	host: envParseString('PGSQL_DATABASE_HOST'),
	port: envParseInteger('PGSQL_DATABASE_PORT'),
	username: envParseString('PGSQL_DATABASE_USER'),
	password: envParseString('PGSQL_DATABASE_PASSWORD'),
	database: envParseString('PGSQL_DATABASE_NAME'),
	entities: [fileURLToPath(new URL('entities/*Entity.js', import.meta.url))],
	migrations: [fileURLToPath(new URL('migrations/*.js', import.meta.url))],
	namingStrategy: new SnakeNamingStrategy(),
	logging: envParseBoolean('TYPEORM_DEBUG_LOGS', false)
});

export const connect = () => AppDataConfig.initialize();
