import { GiveawayEntity, GiveawayEntityData } from '#lib/database';
import { Store } from '@sapphire/framework';
import type { Client } from 'discord.js';

export class GiveawayManager {
	public readonly client: Client;
	public readonly queue: Array<GiveawayEntity> = [];
	private interval: NodeJS.Timer | null = null;

	public constructor(client: Client) {
		this.client = client;
	}

	public async init() {
		const { giveaways } = Store.injectedContext.db;
		const qb = giveaways.createQueryBuilder().select();
		if (this.client.shard) qb.where('guild_id IN (:...ids)', { ids: [...this.client.guilds.cache.keys()] });

		for (const entry of await qb.getMany()) this.insert(entry.setup(this).resume());
		this.check();
	}

	public next() {
		return this.queue.length ? this.queue[0] : null;
	}

	public async run() {
		const now = Date.now();
		const running: Promise<void>[] = [];
		for (const giveaway of this.queue) {
			if (giveaway.refreshAt > now) break;
			running.push(this.runEntry(giveaway));
		}

		await Promise.all(running);
		this.check();
	}

	public add(data: PartialGiveawayData) {
		const giveaway = new GiveawayEntity(data).setup(this);
		this.insert(giveaway);
		return giveaway;
	}

	public async create(data: GiveawayCreateData) {
		const giveaway = new GiveawayEntity({ ...data, messageID: null }).setup(this);
		await giveaway.insert();
		this.insert(giveaway);
		this.check();
	}

	private async runEntry(giveaway: GiveawayEntity) {
		try {
			const index = this.queue.indexOf(giveaway);
			this.queue.splice(index, 1);

			await giveaway.render();
			if (giveaway.finished) await giveaway.remove();
			else this.insert(giveaway);
		} catch (error) {
			this.client.logger.fatal(error);
		}
	}

	private check() {
		if (this.queue.length) {
			if (!this.interval) this.interval = setInterval(this.run.bind(this), 1000);
		} else if (this.interval) {
			clearInterval(this.interval);
			this.interval = null;
		}
		return this;
	}

	private insert(giveaway: GiveawayEntity) {
		const index = this.queue.findIndex((entry) => entry.refreshAt > giveaway.refreshAt);
		if (index === -1) this.queue.push(giveaway);
		else this.queue.splice(index, 0, giveaway);
		return this;
	}
}

export type GiveawayCreateData = Omit<GiveawayEntityData, 'messageID'>;
export type PartialGiveawayData = GiveawayCreateData & { messageID: string | null };
