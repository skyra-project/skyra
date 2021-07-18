import { LazyPaginatedMessage, PaginatedMessageOptions } from '@sapphire/discord.js-utilities';
import { Time } from '@sapphire/time-utilities';

export class SkyraLazyPaginatedMessage extends LazyPaginatedMessage {
	public constructor(options: PaginatedMessageOptions = {}) {
		super(options);
		this.setIdle(Time.Minute * 5);
	}
}
