import { rootFolder } from '#utils/constants';
import Collection from '@discordjs/collection';
import { Store } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
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
				lua: readFileSync(resolve(rootFolder, 'scripts', 'audio', `${command.name}.lua`)).toString()
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

	public async start() {
		for (const guild of Store.injectedContext.client.guilds.cache.values()) {
			const channelID = guild.voice?.channelID;
			if (isNullish(channelID)) continue;

			await this.get(guild.id).player.join(channelID, { deaf: true });
		}
	}
}
