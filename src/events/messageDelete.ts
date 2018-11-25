import { MessageEmbed, TextChannel } from 'discord.js';
import { Event, KlasaMessage } from 'klasa';
import { MessageLogsEnum } from '../lib/util/constants';
import { cutText, getContent, getImage } from '../lib/util/util';

export default class extends Event {

	public async run(message: KlasaMessage): Promise<void> {
		if (!message.guild || message.author.id === this.client.user.id) return;

		const { guild } = message;
		if (!guild.settings.get('events.messageDelete')) return;

		const channel = message.channel as TextChannel;
		this.client.emit('guildMessageLog', channel.nsfw ? MessageLogsEnum.NSFWMessage : MessageLogsEnum.Message, guild, () => new MessageEmbed()
			.setColor(0xFFAB40)
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
			.setDescription(cutText(getContent(message) || '', 1900))
			.setFooter(`${message.language.get('EVENTS_MESSAGE_DELETE')} • ${channel.name}`)
			.setImage(getImage(message))
			.setTimestamp());
	}

}
