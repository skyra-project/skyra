import { DbSet } from '#lib/database';
import { SkyraClient } from '#lib/SkyraClient';
import { TOKENS } from '#root/config';
import { helpUsagePostProcessor, rootFolder } from '#utils/constants';
import '#utils/Sanitizer/initClean';
import { RewriteFrames } from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import * as colorette from 'colorette';
import i18next from 'i18next';
import 'reflect-metadata';
import { inspect } from 'util';

inspect.defaultOptions.depth = 1;
colorette.options.enabled = true;

const client = new SkyraClient();

// TODO: (sapphire migration) i18n check for unused keys
// TODO: (sapphire migration) cleanup unused and non-referenced keys from JSON files

async function main() {
	i18next.use(helpUsagePostProcessor);
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

	try {
		await DbSet.connect();
		await client.login(TOKENS.BOT_TOKEN);
	} catch (error) {
		client.logger.error(error);
		client.destroy();
		process.exit(1);
	}
}

main().catch(client.logger.error);
