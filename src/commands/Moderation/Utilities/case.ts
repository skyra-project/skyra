import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<SkyraCommand.Options>({
	cooldown: 5,
	description: LanguageKeys.Commands.Moderation.CaseDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.CaseExtended,
	permissionLevel: PermissionLevels.Moderator,
	requiredPermissions: ['EMBED_LINKS'],
	runIn: ['text'],
	usage: '<latest|case:integer{0,2147483647}>'
})
export default class extends SkyraCommand {
	public async run(message: GuildMessage, [index]: [number | 'latest']) {
		const modlog = index === 'latest' ? (await message.guild.moderation.fetch()).last() : await message.guild.moderation.fetch(index);
		if (modlog) return message.send(await modlog.prepareEmbed());
		throw await message.resolveKey(LanguageKeys.Commands.Moderation.ReasonNotExists);
	}
}
