import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Identifiers, Precondition } from '@sapphire/framework';
import { hasAtLeastOneKeyInMap } from '@sapphire/utilities';
import type { Message } from 'discord.js';

export class UserPrecondition extends Precondition {
	public async run(message: Message): Precondition.AsyncResult {
		// If not in a guild, resolve on an error:
		if (message.guild === null || message.member === null) {
			return this.error({ identifier: Identifiers.PreconditionGuildOnly });
		}

		const allowedRoles = await message.guild.readSettings(GuildSettings.Music.AllowedRoles);
		if (allowedRoles.length === 0) return this.ok();
		if (hasAtLeastOneKeyInMap(message.member!.roles.cache, allowedRoles)) return this.ok();

		return this.error({ identifier: LanguageKeys.Preconditions.MusicRoleNotAllowed });
	}
}
