import { AsyncPreconditionResult, Precondition } from '@sapphire/framework';
import type { Message } from 'discord.js';

export class UserPrecondition extends Precondition {
	public async run(message: Message): AsyncPreconditionResult {
		if (message.guild === null) return this.error({ identifier: 'GuildOnly' });
		if (await message.member!.isAdmin()) return this.ok();
		return this.error({});
	}
}
