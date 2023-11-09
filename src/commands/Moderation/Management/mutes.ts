import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { PermissionLevels, type GuildMessage } from '#lib/types';
import type { UserPaginatedMessageCommand as Moderations } from '#root/commands/Moderation/Management/moderations';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';

@ApplyOptions<SkyraCommand.Options>(
	SkyraCommand.PaginatedOptions({
		description: LanguageKeys.Commands.Moderation.MutesDescription,
		detailedDescription: LanguageKeys.Commands.Moderation.MutesExtended,
		permissionLevel: PermissionLevels.Moderator,
		runIn: [CommandOptionsRunTypeEnum.GuildAny]
	})
)
export class UserPaginatedMessageCommand extends SkyraCommand {
	public override messageRun(message: GuildMessage, args: SkyraCommand.Args, context: SkyraCommand.RunContext) {
		const command = this.store.get('moderations') as Moderations | undefined;
		if (typeof command === 'undefined') throw new Error('Moderations command not loaded yet.');
		return command.mutes(message, args, context);
	}
}
