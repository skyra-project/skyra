import 'module-alias/register';
import '@utils/initClean';
import 'reflect-metadata';
import { SkyraClient } from '@lib/SkyraClient';
import { DbSet } from '@lib/structures/DbSet';
import { TOKENS } from '@root/config';
import * as sentry from '@sentry/node';
import { floatPromise } from '@utils/util';
import { inspect } from 'util';
inspect.defaultOptions.depth = 1;

const client = new SkyraClient();

async function main() {
	if (TOKENS.SENTRY_URL) {
		sentry.init({ dsn: TOKENS.SENTRY_URL });
	}
	await DbSet.connect();
	await client.login(TOKENS.BOT_TOKEN);
}

floatPromise({ client }, main());
