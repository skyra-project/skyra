import { OWNERS } from '#root/config';
import { AsyncPreconditionResult, Precondition } from '@sapphire/framework';
import type { Message } from 'discord.js';

export class UserPrecondition extends Precondition {
	public async run(message: Message): AsyncPreconditionResult {
		return OWNERS.includes(message.author.id) ? this.ok() : this.error(this.name, 'You are not a bot owner.', { silent: true });
	}
}
