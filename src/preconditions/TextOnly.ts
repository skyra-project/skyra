import type { Message } from 'discord.js';
import { Precondition, PreconditionResult } from '@sapphire/framework';

export class UserPrecondition extends Precondition {
	public run(message: Message): PreconditionResult {
		return message.channel.type === 'text' ? this.ok() : this.error(this.name, 'You cannot run this command in DMs.');
	}
}
