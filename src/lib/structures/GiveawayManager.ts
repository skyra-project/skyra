import { KlasaClient } from 'klasa';
import { Databases } from '../types/constants/Constants';
import { Events } from '../types/Enums';
import { Giveaway, GiveawayCreateData, PartialRawGiveawaySettings } from './Giveaway';
import { RawGiveawaySettings } from '../types/settings/raw/RawGiveawaySettings';

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
		const entries = await (this.client.shard
			? this.client.queries.fetchGiveawaysFromGuilds([...this.client.guilds.keys()])
			: this.client.providers.default.getAll(Databases.Giveaway)) as RawGiveawaySettings[];

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

	public add(data: PartialRawGiveawaySettings) {
		const giveaway = new Giveaway(this, data);
		this.insert(giveaway);
		return giveaway;
	}

	public create(data: GiveawayCreateData) {
		return this.add({ ...data, message_id: null }).init().finally(() => this.check());
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

	private insert(giveaway: Giveaway) {
		const index = this.queue.findIndex(entry => entry.refreshAt > giveaway.refreshAt);
		if (index === -1) this.queue.push(giveaway);
		else this.queue.splice(index, 0, giveaway);
		return this;
	}

}
