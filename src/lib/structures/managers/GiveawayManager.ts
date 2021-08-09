import { GiveawayEntity, GiveawayEntityData } from '#lib/database/entities';
import { container } from '@sapphire/framework';

export class GiveawayManager {
	public readonly queue: GiveawayEntity[] = [];
	private interval: NodeJS.Timer | null = null;

	public async init() {
		const { giveaways } = container.db;
		const qb = giveaways.createQueryBuilder().select();
		if (container.client.shard) qb.where('guild_id IN (:...ids)', { ids: [...container.client.guilds.cache.keys()] });

		for (const entry of await qb.getMany()) this.insert(entry.resume());
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
		const giveaway = new GiveawayEntity(data);
		this.insert(giveaway);
		return giveaway;
	}

	public async create(data: GiveawayCreateData) {
		const giveaway = new GiveawayEntity({ ...data, messageId: null });
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
			container.logger.fatal(error);
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

export type GiveawayCreateData = Omit<GiveawayEntityData, 'messageId'>;
export type PartialGiveawayData = GiveawayCreateData & { messageId: string | null };
