import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { cast } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import type { User } from 'discord.js';
import type Moderations from './moderations';

@ApplyOptions<SkyraCommand.Options>({
	bucket: 2,
	cooldown: 10,
	description: LanguageKeys.Commands.Moderation.MutesDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.MutesExtended,
	permissionLevel: PermissionLevels.Moderator,
	requiredPermissions: ['EMBED_LINKS', 'MANAGE_MESSAGES'],
	runIn: ['text'],
	usage: '[user:username]'
})
export default class extends SkyraCommand {
	public run(message: GuildMessage, [target]: [User?]) {
		const moderations = cast<Moderations | undefined>(this.store.get('moderations'));
		if (typeof moderations === 'undefined') throw new Error('Moderations command not loaded yet.');
		return moderations.run(message, ['mutes', target]);
	}
}
