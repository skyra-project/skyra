import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: [
		'afk',
		'announce',
		'announcement',
		'bd',
		'birthday',
		'birthdays',
		'ctime',
		'current-time',
		'divorce',
		'ffxiv',
		'final-fantasy',
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
		'img',
		'markov',
		'married',
		'marry',
		'npm-package',
		'npm',
		'pnpm-package',
		'pnpm',
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
		'unsubscribe',
		'upbday',
		'upcoming-birthdays',
		'view-birthday',
		'viewbday',
		'yarn-package',
		'yarn'
	],
	description: LanguageKeys.Commands.General.V7Description,
	detailedDescription: LanguageKeys.Commands.General.V7Extended,
	hidden: true
})
export class UserCommand extends SkyraCommand {
	public async messageRun(message: Message, args: SkyraCommand.Args) {
		return send(message, {
			embeds: [
				new MessageEmbed()
					.setColor(await this.container.db.fetchColor(message))
					.setAuthor({
						name: this.container.client.user!.tag,
						iconURL: this.container.client.user!.displayAvatarURL({ size: 128, format: 'png', dynamic: true })
					})
					.setDescription(args.t(LanguageKeys.Commands.General.V7Message, { command: args.commandContext.commandName }))
					.setTimestamp()
			]
		});
	}
}
