import { LanguageKeys } from '#lib/i18n/languageKeys';
import { PaginatedMessageCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import type { UserPaginatedMessageCommand as Moderations } from './moderations';

@ApplyOptions<PaginatedMessageCommand.Options>({
	description: LanguageKeys.Commands.Moderation.MutesDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.MutesExtended,
	permissionLevel: PermissionLevels.Moderator,
	runIn: ['GUILD_ANY']
})
export class UserPaginatedMessageCommand extends PaginatedMessageCommand {
	public run(message: GuildMessage, args: PaginatedMessageCommand.Args, context: PaginatedMessageCommand.Context) {
		const moderations = this.store.get('moderations') as Moderations | undefined;
		if (typeof moderations === 'undefined') throw new Error('Moderations command not loaded yet.');
		return moderations.mutes(message, args, context);
	}
}
