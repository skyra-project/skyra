import { CLIENT_SECRET, LAVALINK_PASSWORD, PGSQL_DATABASE_PASSWORD, TOKENS, WEBHOOK_ERROR } from '@root/config';
import { initClean } from '@utils/clean';

const raw = Object.values(TOKENS)
	.concat([CLIENT_SECRET, LAVALINK_PASSWORD, PGSQL_DATABASE_PASSWORD, WEBHOOK_ERROR.token])
	.filter(value => typeof value === 'string' && value !== '');

initClean([...new Set(raw)]);
