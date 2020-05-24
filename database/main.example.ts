import moduleAlias from 'module-alias';
import { resolve } from 'path';
import migration from './5.4.0';
const PROJECT_ROOT = resolve(__dirname, '..', '..');
moduleAlias.addPath(resolve(PROJECT_ROOT, 'src'));
moduleAlias.addAliases({
	'@utils': resolve(PROJECT_ROOT, 'src', 'lib', 'util'),
	'@lib': resolve(PROJECT_ROOT, 'src', 'lib'),
	'@root': resolve(PROJECT_ROOT, 'src')
});

const PGSQL_DATABASE_OPTIONS: Record<string, string> = {
	database: '',
	password: '',
	user: ''
};

migration(PGSQL_DATABASE_OPTIONS).catch(error => console.error(error));
