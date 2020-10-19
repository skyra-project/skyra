import { existsSync, promises as fsp } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DIST_DIR = resolve(__dirname, '..', 'dist');
const LUA_SCRIPTS_DIR = resolve(__dirname, 'audio');
const OUTPUT_FOLDER = resolve(DIST_DIR, 'lib', 'audio', 'scripts');

if (!existsSync(OUTPUT_FOLDER)) {
	await fsp.mkdir(OUTPUT_FOLDER, { recursive: true });
}

for (const script of await fsp.readdir(LUA_SCRIPTS_DIR)) {
	await fsp.copyFile(resolve(LUA_SCRIPTS_DIR, script), resolve(OUTPUT_FOLDER, script));
}
