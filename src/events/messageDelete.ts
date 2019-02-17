import { MessageEmbed, TextChannel } from 'discord.js';
import { Event, KlasaMessage } from 'klasa';
import { Events } from '../lib/types/Enums';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { MessageLogsEnum } from '../lib/util/constants';
import { cutText, getContent, getImage } from '../lib/util/util';

export default class extends Event {

	public async run(message: KlasaMessage) {
		if (!message.partial && (!message.guild || message.author.id === this.client.user.id)) return;

		const { guild } = message;
		if (!guild.settings.get(GuildSettings.Events.MessageDelete)) return;

		const channel = message.channel as TextChannel;
		this.client.emit(Events.GuildMessageLog, channel.nsfw ? MessageLogsEnum.NSFWMessage : MessageLogsEnum.Message, guild, () => new MessageEmbed()
			.setColor(0xFFAB40)
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
			.setDescription(cutText(getContent(message) || '', 1900))
			.setFooter(`${message.language.get('EVENTS_MESSAGE_DELETE')} • ${channel.name}`)
			.setImage(getImage(message))
			.setTimestamp());
	}

}
