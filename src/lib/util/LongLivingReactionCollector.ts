import { Client, User } from 'discord.js';
import { APIReactionAddData } from '../types/Discord';

export type LongLivingReactionCollectorListener = (reaction: APIReactionAddData, user: User | { id: string }) => void;

export class LongLivingReactionCollector {

	public client: Client;
	public listener: LongLivingReactionCollectorListener;
	public endListener: () => void;

	private _timer: NodeJS.Timeout = null;

	public constructor(client: Client, listener: LongLivingReactionCollectorListener = null, endListener: () => void = null) {
		this.client = client;
		this.listener = listener;
		this.endListener = endListener;
		this.client.llrCollectors.add(this);
	}

	public setListener(listener: LongLivingReactionCollectorListener): this {
		this.listener = listener;
		return this;
	}

	public setEndListener(listener: () => void): this {
		this.endListener = listener;
		return this;
	}

	public get ended(): boolean {
		return this.client.llrCollectors.has(this);
	}

	public send(reaction: APIReactionAddData, user: User | { id: string }): void {
		this.listener(reaction, user);
	}

	public setTime(time: number): this {
		if (this._timer) clearTimeout(this._timer);
		this._timer = setTimeout(() => this.end(), time);
		return this;
	}

	public end(): this {
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

}
