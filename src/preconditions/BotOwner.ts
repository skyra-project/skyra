import { OWNERS } from '#root/config';
import { Precondition } from '@sapphire/framework';
import type { Message } from 'discord.js';

export class UserPrecondition extends Precondition {
	public override messageRun(message: Message): Precondition.Result {
		return OWNERS.includes(message.author.id) ? this.ok() : this.error({ context: { silent: true } });
	}
}
