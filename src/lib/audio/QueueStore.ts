import Collection from '@discordjs/collection';
import { readFileSync } from 'fs';
import type { KeyType, Redis } from 'ioredis';
import { resolve } from 'path';
import { Queue } from './Queue';
import type { QueueClient } from './QueueClient';

interface RedisCommand {
	name: string;
	keys: number;
}

const commands: RedisCommand[] = [
	{
		name: 'lmove',
		keys: 1
	},
	{
		name: 'lremat',
		keys: 1
	},
	{
		name: 'lshuffle',
		keys: 1
	},
	{
		name: 'rpopset',
		keys: 2
	}
];

export interface ExtendedRedis extends Redis {
	lmove: (key: KeyType, from: number, to: number) => Promise<'OK'>;
	lremat: (key: KeyType, index: number) => Promise<'OK'>;
	lshuffle: (key: KeyType, seed: number) => Promise<'OK'>;
	rpopset: (source: KeyType, destination: KeyType) => Promise<string | null>;
}

export class QueueStore extends Collection<string, Queue> {
	public redis: ExtendedRedis;

	public constructor(public readonly client: QueueClient, redis: Redis) {
		super();

		this.redis = redis as any;

		for (const command of commands) {
			this.redis.defineCommand(command.name, {
				numberOfKeys: command.keys,
				lua: readFileSync(resolve(__dirname, 'scripts', `${command.name}.lua`)).toString()
			});
		}
	}

	public get(key: string): Queue {
		let queue = super.get(key);
		if (!queue) {
			queue = new Queue(this, key);
			this.set(key, queue);
		}

		return queue;
	}

	public async start(filter?: (guildID: string) => boolean) {
		const keys = await this.scan('playlists.*');
		const guilds = keys.map((key) => {
			const match = key.match(/^playlists\.(\d+)/);
			if (match) return match[1];
			throw new Error('error extracting guild ID from playlist');
		});

		await Promise.all(
			guilds.map((guild) => {
				if (!filter || filter(guild)) return this.get(guild).start();
				return false;
			})
		);
	}

	protected async scan(pattern: string, cursor = 0): Promise<string[]> {
		const keys: string[] = [];

		// eslint-disable-next-line @typescript-eslint/init-declarations
		let response: [string, string[]];
		do {
			response = await this.redis.scan(cursor, 'MATCH', pattern);
			keys.push(...response[1]);
		} while (response[0] !== '0');

		return keys;
	}
}
