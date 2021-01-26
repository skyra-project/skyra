import { LanguageKeys } from '#lib/i18n/languageKeys';
import { AsyncPreconditionResult, Identifiers, Precondition } from '@sapphire/framework';
import type { Message } from 'discord.js';

export class UserPrecondition extends Precondition {
	public async run(message: Message): AsyncPreconditionResult {
		if (message.guild === null) return this.error({ identifier: Identifiers.PreconditionGuildOnly });
		if (await message.member!.isModerator()) return this.ok();
		return this.error({ identifier: LanguageKeys.Preconditions.Permissions });
	}
}
