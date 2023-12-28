import { DbSet } from '#lib/database';
import '#lib/setup';

import { SkyraClient } from '#lib/SkyraClient';
import { rootFolder } from '#utils/constants';
import { container } from '@sapphire/framework';
import { RewriteFrames } from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import { envIsDefined, envParseString } from '@skyra/env-utilities';

const client = new SkyraClient();

async function main() {
	// Load in Sentry for error logging
	if (envIsDefined('SENTRY_URL')) {
		Sentry.init({
			dsn: envParseString('SENTRY_URL'),
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
		// Connect to the Database
		container.db = await DbSet.connect();

		// Login to the Discord gateway
		await client.login();
	} catch (error) {
		container.logger.error(error);
		await client.destroy();
		process.exit(1);
	}
}

main().catch(container.logger.error.bind(container.logger));
