import { envParseInteger, envParseString } from '@skyra/env-utilities';
import { Client, container } from '@skyra/http-framework';
import { MessageBroker, Redis, Cache, RedisOptions } from 'skyra-shared';
import * as Sentry from '@sentry/node';
import { RewriteFrames } from '@sentry/integrations';
import { fileURLToPath } from 'node:url';

export function createClient(options: ClientOptions = {}) {
	new Client({
		discordToken: envParseString('DISCORD_TOKEN'),
		discordPublicKey: envParseString('DISCORD_PUBLIC_KEY')
	});

	container.redis = new Redis({
		...options.redis,
		lazyConnect: true,
		host: envParseString('REDIS_HOST'),
		port: envParseInteger('REDIS_PORT'),
		db: envParseInteger('REDIS_DB'),
		password: envParseString('REDIS_PASSWORD')
	});
	container.cache = new Cache({
		client: container.redis,
		prefix: 's7'
	});
	container.broker = new MessageBroker({
		redis: container.redis,
		stream: envParseString('BROKER_STREAM_NAME'),
		block: envParseInteger('BROKER_BLOCK', 5000),
		max: envParseInteger('BROKER_MAX', 10)
	});

	const srcFolderURL = new URL('..', import.meta.url);
	container.stores.registerPath(fileURLToPath(srcFolderURL));

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
				new RewriteFrames({ root: fileURLToPath(new URL('..', srcFolderURL)) })
			]
		});
	}
}

export async function loadAll() {
	await container.redis.connect();
	await container.stores.load();
	await container.client.load();
}

export interface ClientOptions {
	redis?: Omit<RedisOptions, 'lazyConnect' | 'host' | 'port' | 'db' | 'password'>;
}

declare module '@sapphire/pieces' {
	interface Container {
		broker: MessageBroker;
		cache: Cache;
		redis: Redis;

		// db: DbSet;
		// schedule: ScheduleManager;
		// settings: SettingsManager;
		// workers: WorkerManager;
	}
}
