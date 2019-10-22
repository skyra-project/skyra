import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { TextChannel, MessageEmbed } from 'discord.js';
import { getContent, getImage, getColor } from '../../lib/util/util';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['sniped'],
			description: language => language.tget('COMMAND_SNIPE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_SNIPE_EXTENDED'),
			runIn: ['text']
		});
	}

	public run(message: KlasaMessage) {
		const channel = message.channel as TextChannel;
		if (channel.sniped === null) throw message.language.tget('COMMAND_SNIPE_EMPTY');

		const embed = new MessageEmbed()
			.setTitle(message.language.tget('COMMAND_SNIPE_TITLE'))
			.setAuthor(channel.sniped.author.username, channel.sniped.author.displayAvatarURL({ size: 64 }))
			.setTimestamp(channel.sniped.createdTimestamp);

		const color = getColor(channel.sniped);
		if (color !== null) embed.setColor(color);
		const content = getContent(channel.sniped);
		if (content !== null) embed.setDescription(content);
		const image = getImage(channel.sniped);
		if (image !== null) embed.setImage(image);

		return message.sendEmbed(embed);
	}

}
