import { AsyncPreconditionResult, Precondition } from '@sapphire/framework';
import type { Message } from 'discord.js';

export class UserPrecondition extends Precondition {
	public async run(message: Message): AsyncPreconditionResult {
		if (message.guild === null) return this.error('GuildOnly', 'You cannot run this command in DMs.');
		if (await message.member!.isAdmin()) return this.ok();
		return this.error(this.name, 'You are not an administrator.');
	}
}
