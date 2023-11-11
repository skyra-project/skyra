import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { getColor } from '#utils/util';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits, type Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['support-server', 'server'],
	description: LanguageKeys.Commands.System.SupportDescription,
	detailedDescription: LanguageKeys.Commands.System.SupportExtended,
	guarded: true,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks]
})
export class UserCommand extends SkyraCommand {
	public override messageRun(message: Message, args: SkyraCommand.Args) {
		const embed = new EmbedBuilder()
			.setTitle(args.t(LanguageKeys.Commands.System.SupportEmbedTitle, { username: message.author.displayName }))
			.setDescription(args.t(LanguageKeys.Commands.System.SupportEmbedDescription))
			.setColor(getColor(message));
		return send(message, { embeds: [embed] });
	}
}
