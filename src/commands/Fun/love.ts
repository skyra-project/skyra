import { MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { getColor } from '../../lib/util/util';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: language => language.tget('COMMAND_LOVE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_LOVE_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			runIn: ['text'],
			spam: true,
			usage: '<user:username>'
		});
	}

	public async run(message: KlasaMessage, [user]: [KlasaUser]) {
		const isSelf = message.author!.id === user.id;
		const percentage = isSelf ? 1 : Math.random();
		const estimatedPercentage = Math.ceil(percentage * 100);

		let result;
		if (estimatedPercentage < 45) {
			result = message.language.tget('COMMAND_LOVE_LESS45');
		} else if (estimatedPercentage < 75) {
			result = message.language.tget('COMMAND_LOVE_LESS75');
		} else if (estimatedPercentage < 100) {
			result = message.language.tget('COMMAND_LOVE_LESS100');
		} else {
			result = isSelf
				? message.language.tget('COMMAND_LOVE_ITSELF')
				: message.language.tget('COMMAND_LOVE_100');
		}

		return message.sendEmbed(new MessageEmbed()
			.setColor(getColor(message) || 0xFFAB2D)
			.setAuthor('❤ Love Meter ❤', message.author!.displayAvatarURL())
			.setThumbnail('https://twemoji.maxcdn.com/2/72x72/1f49e.png')
			.setDescription([
				`💗 **${user.tag}**`,
				`💗 **${message.author!.tag}**\n`,
				`${estimatedPercentage}% \`[${'█'.repeat(Math.round(percentage * 40)).padEnd(40, '\u00A0')}]\`\n`,
				`**${message.language.tget('COMMAND_LOVE_RESULT')}**: ${result}`
			].join('\n')));
	}

}
