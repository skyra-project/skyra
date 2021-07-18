import { PaginatedMessage, PaginatedMessageOptions } from '@sapphire/discord.js-utilities';
import { Time } from '@sapphire/time-utilities';

export class SkyraPaginatedMessage extends PaginatedMessage {
	public constructor(options: PaginatedMessageOptions = {}) {
		super(options);
		this.setIdle(Time.Minute * 5);
	}
}
