import 'module-alias/register';
import '@utils/initClean';
import 'reflect-metadata';
import { SkyraClient } from '@lib/SkyraClient';
import { DbSet } from '@lib/structures/DbSet';
import { TOKENS } from '@root/config';
import * as Sentry from '@sentry/node';
import { floatPromise } from '@utils/util';
import { inspect } from 'util';
import { RewriteFrames } from '@sentry/integrations';
import { rootFolder } from '@utils/constants';
inspect.defaultOptions.depth = 1;

const client = new SkyraClient();

async function main() {
	if (TOKENS.SENTRY_URL) {
		Sentry.init({
			dsn: TOKENS.SENTRY_URL,
			integrations: [
				new Sentry.Integrations.Modules(),
				new Sentry.Integrations.FunctionToString(),
				new Sentry.Integrations.LinkedErrors(),
				new Sentry.Integrations.Console(),
				new Sentry.Integrations.Http({ breadcrumbs: true, tracing: true }),
				new RewriteFrames({ root: rootFolder })
			]
		});
	}
	await DbSet.connect();
	await client.login(TOKENS.BOT_TOKEN);
}

floatPromise({ client }, main());
