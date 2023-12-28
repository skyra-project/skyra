import { minutes } from '#utils/common';
import { LazyPaginatedMessage, type PaginatedMessageOptions } from '@sapphire/discord.js-utilities';

export class SkyraLazyPaginatedMessage extends LazyPaginatedMessage {
	public constructor(options: PaginatedMessageOptions = {}, idle = minutes(5)) {
		super(options);
		this.setIdle(idle);
	}
}
