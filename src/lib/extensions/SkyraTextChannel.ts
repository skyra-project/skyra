import { Message, Structures, TextChannel } from 'discord.js';

const snipes = new WeakMap<TextChannel, SnipedMessage>();

export class SkyraTextChannel extends Structures.get('TextChannel') {
	public set sniped(value: Message | null) {
		const previous = snipes.get(this);
		if (typeof previous !== 'undefined') this.client.clearTimeout(previous.timeout);

		if (value === null) {
			snipes.delete(this);
		} else {
			const next: SnipedMessage = {
				message: value,
				timeout: this.client.setTimeout(() => snipes.delete(this), 15000)
			};
			snipes.set(this, next);
		}
	}

	public get sniped() {
		const current = snipes.get(this);
		return typeof current === 'undefined' ? null : current.message;
	}
}

export interface SnipedMessage {
	message: Message;
	timeout: NodeJS.Timeout;
}

declare module 'discord.js' {
	export interface TextChannel {
		sniped: Message | null;
		toString(): string;
	}
}

Structures.extend('TextChannel', () => SkyraTextChannel);
