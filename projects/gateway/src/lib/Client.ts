import { REST, RESTOptions } from '@discordjs/rest';
import { OptionalWebSocketManagerOptions, RequiredWebSocketManagerOptions, WebSocketManager } from '@discordjs/ws';
import { envParseInteger, envParseString } from '@skyra/env-utilities';
import { fileURLToPath } from 'node:url';
import { Cache, container, ListenerStore, MessageBroker, Redis, type RedisOptions } from 'skyra-shared';

export function createClient(options: ClientOptions) {
	const token = envParseString('DISCORD_TOKEN');
	container.rest = new REST(options.rest).setToken(token);
	container.ws = new WebSocketManager({
		...options.ws,
		rest: container.rest,
		token
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

	// TODO: PR URL support for registerPath
	container.stores.register(new ListenerStore());
	container.stores.registerPath(fileURLToPath(new URL('..', import.meta.url)));
}

export async function loadAll() {
	await container.redis.connect();
	await container.stores.load();
	await container.ws.connect();
}

export interface ClientOptions {
	redis?: Omit<RedisOptions, 'lazyConnect' | 'host' | 'port' | 'db' | 'password'>;
	rest?: Partial<RESTOptions>;
	ws: Omit<RequiredWebSocketManagerOptions & Partial<OptionalWebSocketManagerOptions>, 'rest' | 'token'>;
}

declare module '@sapphire/pieces' {
	interface Container {
		broker: MessageBroker;
		cache: Cache;
		redis: Redis;
		rest: REST;
		ws: WebSocketManager;
	}
}
