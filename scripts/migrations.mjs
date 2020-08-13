import 'module-alias/register.js';
import { promises as fsp } from 'fs';
import { dirname, resolve } from 'path';
import typeorm from 'typeorm';
import { fileURLToPath } from 'url';
import dbConfig from '../dist/lib/orm/dbConfig.js';

const { config } = dbConfig;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const [sqlScript, connection] = await Promise.all([
	fsp.readFile(resolve(__dirname, 'SetMigrations.sql'), { encoding: 'utf-8' }),
	typeorm.createConnection(config)
]);

await connection.query(sqlScript);
