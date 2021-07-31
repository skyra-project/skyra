import { minutes } from '#utils/common';
import { LazyPaginatedMessage, PaginatedMessageOptions } from '@sapphire/discord.js-utilities';

export class SkyraLazyPaginatedMessage extends LazyPaginatedMessage {
	public constructor(options: PaginatedMessageOptions = {}) {
		super(options);
		this.setIdle(minutes(5));
	}
}
