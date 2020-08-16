import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { CdnUrls } from '@lib/types/Constants';
import { MessageEmbed, User } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: (language) => language.tget('COMMAND_LOVE_DESCRIPTION'),
			extendedHelp: (language) => language.tget('COMMAND_LOVE_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			runIn: ['text'],
			spam: true,
			usage: '<user:username>'
		});
	}

	public async run(message: KlasaMessage, [user]: [User]) {
		const isSelf = message.author.id === user.id;
		const percentage = isSelf ? 1 : Math.random();
		const estimatedPercentage = Math.ceil(percentage * 100);

		let result: string | undefined = undefined;
		if (estimatedPercentage < 45) {
			result = message.language.tget('COMMAND_LOVE_LESS45');
		} else if (estimatedPercentage < 75) {
			result = message.language.tget('COMMAND_LOVE_LESS75');
		} else if (estimatedPercentage < 100) {
			result = message.language.tget('COMMAND_LOVE_LESS100');
		} else {
			result = isSelf ? message.language.tget('COMMAND_LOVE_ITSELF') : message.language.tget('COMMAND_LOVE_100');
		}

		return message.sendEmbed(
			new MessageEmbed()
				.setColor(await DbSet.fetchColor(message))
				.setAuthor('❤ Love Meter ❤', message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
				.setThumbnail(CdnUrls.RevolvingHeartTwemoji)
				.setDescription(
					[
						`💗 **${user.tag}**`,
						`💗 **${message.author.tag}**\n`,
						`${estimatedPercentage}% \`[${'█'.repeat(Math.round(percentage * 40)).padEnd(40, '\u00A0')}]\`\n`,
						`**${message.language.tget('COMMAND_LOVE_RESULT')}**: ${result}`
					].join('\n')
				)
		);
	}
}
