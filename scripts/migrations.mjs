import { readFile } from 'node:fs/promises';
import { AppDataConfig } from '../dist/lib/database/database.config.js';

AppDataConfig.setOptions({ logging: true });

const [sqlScript, connection] = await Promise.all([
	readFile(new URL('SetMigrations.sql', import.meta.url), { encoding: 'utf-8' }),
	AppDataConfig.initialize()
]);

await connection.query(sqlScript);
await connection.destroy();
