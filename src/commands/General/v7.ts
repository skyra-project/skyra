import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: [
		'8ball',
		'afk',
		'announce',
		'announcement',
		'bd',
		'birthday',
		'birthdays',
		'chucknorris',
		'ctime',
		'current-time',
		'divorce',
		'dsearch',
		'duckduckgo',
		'emojis',
		'emotes',
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
		'howtoflirt',
		'img',
		'letmegooglethat',
		'letmegooglethatforyou',
		'lmgtfy',
		'markov',
		'married',
		'marry',
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
		'sse',
		'star',
		'subscribe',
		'topinvites',
		'topinvs',
		'trigger',
		'triggers',
		'unsubscribe',
		'upbday',
		'upcoming-birthdays',
		'updoot',
		'upvote',
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
	public async messageRun(message: Message, args: SkyraCommand.Args) {
		const embed = new MessageEmbed()
			.setColor(await this.container.db.fetchColor(message))
			.setAuthor({
				name: this.container.client.user!.tag,
				iconURL: this.container.client.user!.displayAvatarURL({ size: 128, format: 'png', dynamic: true })
			})
			.setDescription(args.t(LanguageKeys.Commands.General.V7Message, { command: args.commandContext.commandName }))
			.setTimestamp();
		return send(message, { embeds: [embed] });
	}
}
