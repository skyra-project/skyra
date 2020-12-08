import { existsSync } from 'fs';
import { copyFile, mkdir, readdir } from 'fs/promises';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DIST_DIR = resolve(__dirname, '..', 'dist');
const LUA_SCRIPTS_DIR = resolve(__dirname, 'audio');
const OUTPUT_FOLDER = resolve(DIST_DIR, 'lib', 'audio', 'scripts');

if (!existsSync(OUTPUT_FOLDER)) {
	await mkdir(OUTPUT_FOLDER, { recursive: true });
}

for (const script of await readdir(LUA_SCRIPTS_DIR)) {
	await copyFile(resolve(LUA_SCRIPTS_DIR, script), resolve(OUTPUT_FOLDER, script));
}
