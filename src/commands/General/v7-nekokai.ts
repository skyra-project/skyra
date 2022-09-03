import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { getColor } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: [
		'ani-list',
		'anime',
		'kitsu-anime',
		'kitsu-manga',
		'manga-list',
		'manga',
		'slap',
		'waifu',
		'wbang',
		'wbanghead',
		'wbite',
		'wblush',
		'wcry',
		'wcuddle',
		'wdance',
		'wgreet',
		'whug',
		'wkiss',
		'wlewd',
		'wlick',
		'wneko',
		'wnom',
		'wpat',
		'wpout',
		'wpunch',
		'wsalute',
		'wslap',
		'wsleepy',
		'wsmile',
		'wsmug',
		'wstare',
		'wthumbsup',
		'wtickle'
	],
	description: LanguageKeys.Commands.General.V7Description,
	detailedDescription: LanguageKeys.Commands.General.V7Extended,
	hidden: true,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks]
})
export class UserCommand extends SkyraCommand {
	public messageRun(message: Message, args: SkyraCommand.Args) {
		const embed = new MessageEmbed()
			.setColor(getColor(message))
			.setAuthor({
				name: this.container.client.user!.tag,
				iconURL: this.container.client.user!.displayAvatarURL({ size: 128, format: 'png', dynamic: true })
			})
			.setDescription(args.t(LanguageKeys.Commands.General.V7NekokaiMessage, { command: args.commandContext.commandName }))
			.setTimestamp();
		return send(message, { embeds: [embed] });
	}
}
