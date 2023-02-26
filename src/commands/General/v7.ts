import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { getColor } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	name: '\u200Bv7',
	aliases: [
		'8ball',
		'afk',
		'announce',
		'announcement',
		'bd',
		'birthday',
		'birthdays',
		'chucknorris',
		'country',
		'ctime',
		'current-time',
		'divorce',
		'dsearch',
		'duckduckgo',
		'emojis',
		'emotes',
		'eshop',
		'ffxiv',
		'final-fantasy',
		'flip',
		'flow',
		'g',
		'gc',
		'gcreate',
		'ge',
		'gend',
		'gimage',
		'giveaway-end',
		'giveaway',
		'giveawayschedule',
		'google',
		'googleimage',
		'googlesearch',
		'gr',
		'greroll',
		'groll',
		'gs',
		'gschedule',
		'gsearch',
		'gstart',
		'horoscope',
		'howtoflirt',
		'igdb',
		'img',
		'itunes',
		'letmegooglethat',
		'letmegooglethatforyou',
		'lmgtfy',
		'markov',
		'married',
		'marry',
		'movie',
		'movies',
		'nick',
		'nickname',
		'norris',
		'npm-package',
		'npm',
		'pants',
		'peepolove',
		'pepelove',
		'pnpm-package',
		'pnpm',
		'pun',
		'quote',
		'reddit-user',
		'redditor',
		'reset-birthday',
		'search',
		'set-birthday',
		'set-starboard-emoji',
		'setbday',
		'show',
		'shows',
		'sse',
		'star',
		'subscribe',
		'tmdb',
		'topinvites',
		'topinvs',
		'trigger',
		'triggers',
		'tv',
		'tvdb',
		'ud',
		'unsubscribe',
		'upbday',
		'upcoming-birthdays',
		'updoot',
		'upvote',
		'urban',
		'urbandictionary',
		'view-birthday',
		'viewbday',
		'waporwave',
		'yarn-package',
		'yarn',
		'zalgo'
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
			.setDescription(args.t(LanguageKeys.Commands.General.V7Message, { command: args.commandContext.commandName }))
			.setTimestamp();
		return send(message, { embeds: [embed] });
	}
}
