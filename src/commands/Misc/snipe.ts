import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { getColor, getContent, getImage } from '@utils/util';
import { MessageEmbed, TextChannel } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['sniped'],
			description: language => language.tget('COMMAND_SNIPE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_SNIPE_EXTENDED'),
			requiredPermissions: ['EMBED_LINKS'],
			runIn: ['text']
		});
	}

	public run(message: KlasaMessage) {
		const { sniped } = message.channel as TextChannel;
		if (sniped === null) throw message.language.tget('COMMAND_SNIPE_EMPTY');

		const embed = new MessageEmbed()
			.setTitle(message.language.tget('COMMAND_SNIPE_TITLE'))
			.setColor(getColor(sniped))
			.setAuthor(sniped.author.username, sniped.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setTimestamp(sniped.createdTimestamp);

		const content = getContent(sniped);
		if (content !== null) embed.setDescription(content);
		const image = getImage(sniped);
		if (image !== null) embed.setImage(image);

		return message.sendEmbed(embed);
	}

}
