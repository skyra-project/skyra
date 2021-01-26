import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SkyraCommand.Options>({
	cooldown: 5,
	description: LanguageKeys.Commands.Moderation.CaseDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.CaseExtended,
	permissionLevel: PermissionLevels.Moderator,
	permissions: ['EMBED_LINKS'],
	runIn: ['text']
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const index = await args.pick('case');
		const modlog = await message.guild.moderation.fetch(index);
		if (modlog) return message.send(await modlog.prepareEmbed());
		this.error(LanguageKeys.Commands.Moderation.ReasonNotExists);
	}
}
