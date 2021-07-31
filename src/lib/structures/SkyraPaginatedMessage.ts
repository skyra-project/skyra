import { minutes } from '#utils/common';
import { PaginatedMessage, PaginatedMessageOptions } from '@sapphire/discord.js-utilities';

export class SkyraPaginatedMessage extends PaginatedMessage {
	public constructor(options: PaginatedMessageOptions = {}) {
		super(options);
		this.setIdle(minutes(5));
	}
}
