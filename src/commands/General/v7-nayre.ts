import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { getColor } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	name: '\u200Bv7-nayre',
	aliases: [
		'balance',
		'bal',
		'credits',
		'coinflip',
		'cf',
		'daily',
		'dailies',
		'higherlower',
		'hilo',
		'hl',
		'pay',
		'slotmachine',
		'slot',
		'slots',
		'slotmachines',
		'vault',
		'bank',
		'wheeloffortune',
		'wof',
		'autorole',
		'autoroles',
		'levelrole',
		'lvlrole',
		'social',
		'leaderboard',
		'lb',
		'top',
		'scoreboard',
		'level',
		'lvl',
		'rank',
		'mylevel',
		'profile',
		'banner',
		'banners',
		'wallpaper',
		'wallpapers',
		'background',
		'backgrounds',
		'setcolor',
		'setcolour',
		'toggledarkmode',
		'darkmode',
		'toggledarktheme',
		'darktheme',
		'reputation',
		'rep'
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
			.setDescription(args.t(LanguageKeys.Commands.General.V7NayreMessage, { command: args.commandContext.commandName }))
			.setTimestamp();
		return send(message, { embeds: [embed] });
	}
}
