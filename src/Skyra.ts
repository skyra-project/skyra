import { DbSet } from '#lib/database';
import '#lib/setup';

import { SkyraClient } from '#lib/SkyraClient';
import { helpUsagePostProcessor, rootFolder } from '#utils/constants';
import { container } from '@sapphire/framework';
import { RewriteFrames } from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import i18next from 'i18next';

const client = new SkyraClient();

async function main() {
	// Load in i18next post processor
	i18next.use(helpUsagePostProcessor);

	// Load in Sentry for error logging
	if (process.env.SENTRY_URL) {
		Sentry.init({
			dsn: process.env.SENTRY_URL,
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
		// Wait for gRPC to connect
		await container.grpc.start();

		// Connect to the Database
		container.db = await DbSet.connect();

		// Login to the Discord gateway
		await client.login();
	} catch (error) {
		container.logger.error(error);
		client.destroy();
		process.exit(1);
	}
}

main().catch(container.logger.error.bind(container.logger));
