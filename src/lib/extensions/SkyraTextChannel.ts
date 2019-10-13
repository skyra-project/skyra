import { Structures, Message } from 'discord.js';
import { enumerable } from '../util/util';

export class SkyraTextChannel extends Structures.get('TextChannel') {

	/**
	 * The sniped message
	 */
	@enumerable(false)
	public sniped: Message | null = null;

	@enumerable(false)
	public snipedTimestamp: number | null = null;

	@enumerable(false)
	public snipedTimeout: NodeJS.Timeout | null = null;

	public get snipedAt() {
		return this.snipedTimestamp === null ? null : new Date(this.snipedTimestamp);
	}

}

declare module 'discord.js' {
	export interface TextChannel {
		sniped: Message | null;
		snipedTimestamp: number | null;
		snipedTimeout: NodeJS.Timeout | null;
		readonly snipedAt: Date | null;
	}
}

Structures.extend('TextChannel', () => SkyraTextChannel);
