import { readFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import typeorm from 'typeorm';
import { fileURLToPath } from 'url';
import dbConfig from '../dist/lib/database/database.config.js';

const { config } = dbConfig;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const [sqlScript, connection] = await Promise.all([
	readFile(resolve(__dirname, 'SetMigrations.sql'), { encoding: 'utf-8' }),
	typeorm.createConnection(config)
]);

await connection.query(sqlScript);
