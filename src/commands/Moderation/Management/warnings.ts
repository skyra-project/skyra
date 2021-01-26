import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand, SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import type { UserPaginatedMessageCommand as Moderations } from './moderations';

@ApplyOptions<SkyraCommand.Options>({
	bucket: 2,
	cooldown: 10,
	description: LanguageKeys.Commands.Moderation.WarningsDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.WarningsExtended,
	permissionLevel: PermissionLevels.Moderator,
	runIn: ['text']
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public run(message: GuildMessage, args: PaginatedMessageCommand.Args, context: PaginatedMessageCommand.Context) {
		const moderations = this.store.get('moderations') as Moderations | undefined;
		if (typeof moderations === 'undefined') throw new Error('Moderations command not loaded yet.');
		return moderations.mutes(message, args, context);
	}
}
