// Config must be the first to be loaded, as it sets the env:
import '#root/config';

// Import everything else:
import { envParseBoolean, envParseInteger, envParseString } from '#lib/env';
import { join } from 'path';
import { Connection, ConnectionOptions, createConnection, getConnection } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import './repositories/ClientRepository';
import './repositories/MemberRepository';
import './repositories/UserRepository';

export const config: ConnectionOptions = {
	type: 'postgres',
	host: envParseString('PGSQL_DATABASE_HOST'),
	port: envParseInteger('PGSQL_DATABASE_PORT'),
	username: envParseString('PGSQL_DATABASE_USER'),
	password: envParseString('PGSQL_DATABASE_PASSWORD'),
	database: envParseString('PGSQL_DATABASE_NAME'),
	entities: [join(__dirname, 'entities/*Entity.js')],
	migrations: [join(__dirname, 'migrations/*.js')],
	cli: {
		entitiesDir: 'src/lib/database/entities',
		migrationsDir: 'src/lib/database/migrations',
		subscribersDir: 'src/lib/database/subscribers'
	},
	namingStrategy: new SnakeNamingStrategy(),
	logging: envParseBoolean('TYPEORM_DEBUG_LOGS', false)
};

export const connect = (): Promise<Connection> => {
	try {
		return Promise.resolve(getConnection());
	} catch {
		return createConnection(config);
	}
};
