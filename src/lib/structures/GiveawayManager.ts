import { KlasaClient } from 'klasa';
import { Databases } from '../types/constants/Constants';
import { Events } from '../types/Enums';
import { Giveaway, GiveawayCreateData, GiveawayData } from './Giveaway';

export class GiveawayManager {

	public client: KlasaClient;
	public readonly queue: Array<Giveaway> = [];
	private readonly pending: Giveaway[] = [];
	private interval: NodeJS.Timer | null = null;
	private readonly running: Array<Promise<void>> = [];

	public constructor(client: KlasaClient) {
		this.client = client;
	}

	public async init() {
		const r = this.client.providers.default.db;
		const entries = await (this.client.shard
			? r.table(Databases.Giveaway).getAll(...this.client.guilds.keys(), { index: 'guildID' })
			: r.table(Databases.Giveaway)).run() as GiveawayData[];

		for (const entry of entries) this.add(entry);
		this.check();
	}

	public next() {
		return this.queue.length ? this.queue[0] : null;
	}

	public async run() {
		// If running, don't re-execute
		if (this.running.length) return;

		const now = Date.now();
		for (const giveaway of this.queue) {
			if (giveaway.refreshAt > now) break;
			this.running.push(this.runGiveaway());
		}

		await Promise.all(this.running);
		this.running.length = 0;

		// TODO: Optimize this to not be O(n^2)
		// Add all elements from the pending queue
		while (this.pending.length) this.insert(this.pending.shift()!);
		this.check();
	}

	public add(data: GiveawayData) {
		const giveaway = new Giveaway(this, data);
		this.insert(giveaway);
		return giveaway;
	}

	public async create(data: GiveawayCreateData) {
		const created = data as GiveawayData;
		created.id = this.generateID();
		return this.add(created).init().finally(() => this.check());
	}

	public async remove(index: number | string) {
		const entry = this.get(index);
		if (entry) await entry.destroy();
		return this;
	}

	public get(index: number | string) {
		if (typeof index === 'string') index = this.queue.findIndex(value => value.id === index);
		return this.checkBounds(index) ? this.queue[index] : null;
	}

	private async runGiveaway() {
		try {
			const giveaway = await this.queue.shift()!.render();
			if (!giveaway.finished) this.pending.push(giveaway);
		} catch (error) {
			this.client.emit(Events.Wtf, error);
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

	private checkBounds(index: number) {
		if (!this.queue.length) return false;
		return index >= 0 && index < this.queue.length;
	}

	private insert(giveaway: Giveaway) {
		const index = this.queue.findIndex(entry => entry.refreshAt > giveaway.refreshAt);
		if (index === -1) this.queue.push(giveaway);
		else this.queue.splice(index, 0, giveaway);
		return this;
	}

	private generateID() {
		const shardID = this.client.shard ? this.client.shard.ids[0] : 0;
		return `${Date.now().toString(36)}${shardID.toString(36)}`;
	}

}
