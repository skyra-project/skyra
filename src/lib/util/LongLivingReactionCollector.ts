import { noop } from '@sapphire/utilities';
import { Client, Guild, TextChannel, User } from 'discord.js';
import { Time } from './constants';

export type LongLivingReactionCollectorListener = (reaction: LLRCData) => void;

export class LongLivingReactionCollector {
	public client: Client;
	public listener: LongLivingReactionCollectorListener | null;
	public endListener: (() => void) | null;

	private _timer: NodeJS.Timeout | null = null;

	public constructor(client: Client, listener: LongLivingReactionCollectorListener | null = null, endListener: (() => void) | null = null) {
		this.client = client;
		this.listener = listener;
		this.endListener = endListener;
		this.client.llrCollectors.add(this);
	}

	public setListener(listener: LongLivingReactionCollectorListener | null) {
		this.listener = listener;
		return this;
	}

	public setEndListener(listener: () => void) {
		this.endListener = listener;
		return this;
	}

	public get ended(): boolean {
		return this.client.llrCollectors.has(this);
	}

	public send(reaction: LLRCData): void {
		if (this.listener) this.listener(reaction);
	}

	public setTime(time: number) {
		if (this._timer) clearTimeout(this._timer);
		if (time === -1) this._timer = null;
		else this._timer = setTimeout(() => this.end(), time);
		return this;
	}

	public end() {
		if (!this.client.llrCollectors.delete(this)) return this;

		if (this._timer) {
			clearTimeout(this._timer);
			this._timer = null;
		}
		if (this.endListener) {
			process.nextTick(this.endListener.bind(null));
			this.endListener = null;
		}
		return this;
	}

	public static collectOne(client: Client, { filter = () => true, time = Time.Minute * 5 }: LLRCCollectOneOptions = {}) {
		return new Promise<LLRCData | null>((resolve) => {
			const llrc = new LongLivingReactionCollector(
				client,
				(reaction) => {
					if (filter(reaction)) {
						resolve(reaction);
						llrc.setEndListener(noop).end();
					}
				},
				() => {
					resolve(null);
				}
			).setTime(time);
		});
	}
}

export interface LLRCCollectOneOptions {
	filter?: (reaction: LLRCData) => boolean;
	time?: number;
}

export interface LLRCDataEmoji {
	animated: boolean;
	id: string | null;
	managed: boolean | null;
	name: string | null;
	requireColons: boolean | null;
	roles: string[] | null;
	user: User | { id: string };
}

export interface LLRCData {
	channel: TextChannel;
	emoji: LLRCDataEmoji;
	guild: Guild;
	messageID: string;
	userID: string;
}
