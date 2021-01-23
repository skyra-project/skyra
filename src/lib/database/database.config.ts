import { PGSQL_DATABASE_HOST, PGSQL_DATABASE_NAME, PGSQL_DATABASE_PASSWORD, PGSQL_DATABASE_PORT, PGSQL_DATABASE_USER } from '#root/config';
import { join } from 'path';
import { Connection, ConnectionOptions, createConnection, getConnection } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import './repositories/ClientRepository';
import './repositories/MemberRepository';
import './repositories/UserRepository';

export const config: ConnectionOptions = {
	type: 'postgres',
	host: PGSQL_DATABASE_HOST,
	port: PGSQL_DATABASE_PORT,
	username: PGSQL_DATABASE_USER,
	password: PGSQL_DATABASE_PASSWORD,
	database: PGSQL_DATABASE_NAME,
	entities: [join(__dirname, 'entities/*Entity.js')],
	migrations: [join(__dirname, 'migrations/*.js')],
	cli: {
		entitiesDir: 'src/lib/database/entities',
		migrationsDir: 'src/lib/database/migrations',
		subscribersDir: 'src/lib/database/subscribers'
	},
	namingStrategy: new SnakeNamingStrategy(),
	logging: false
};

export const connect = (): Promise<Connection> => {
	try {
		return Promise.resolve(getConnection());
	} catch {
		return createConnection(config);
	}
};
