import { Precondition, PreconditionResult } from '@sapphire/framework';
import type { Message } from 'discord.js';

export class UserPrecondition extends Precondition {
	public run(message: Message): PreconditionResult {
		return message.channel.type === 'news' ? this.ok() : this.error({});
	}
}
