import { MessageEmbed, TextChannel } from 'discord.js';
import { Event, KlasaMessage } from 'klasa';
import { Events } from '../lib/types/Enums';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { MessageLogsEnum } from '../lib/util/constants';
import { cutText, getContent, getImage } from '../lib/util/util';

export default class extends Event {

	public run(message: KlasaMessage) {
		if (message.partial || !message.guild || message.author!.id === this.client.user!.id) return;

		this.handleMessageLogs(message);
		this.handleSnipeMessage(message);
	}

	private handleMessageLogs(message: KlasaMessage) {
		const [enabled, ignoreChannels] = message.guild!.settings
			.pluck(GuildSettings.Events.MessageDelete, GuildSettings.Messages.IgnoreChannels) as [GuildSettings.Events.MessageDelete, GuildSettings.Messages.IgnoreChannels];
		if (!enabled || ignoreChannels.includes(message.channel.id)) return;

		const channel = message.channel as TextChannel;
		this.client.emit(Events.GuildMessageLog, channel.nsfw ? MessageLogsEnum.NSFWMessage : MessageLogsEnum.Message, message.guild, () => new MessageEmbed()
			.setColor(0xFFAB40)
			.setAuthor(`${message.author!.tag} (${message.author!.id})`, message.author!.displayAvatarURL())
			.setDescription(cutText(getContent(message) || '', 1900))
			.setFooter(`${message.language.get('EVENTS_MESSAGE_DELETE')} • ${channel.name}`)
			.setImage(getImage(message)!)
			.setTimestamp());
	}

	private handleSnipeMessage(message: KlasaMessage) {
		const channel = message.channel as TextChannel;
		if (channel instanceof TextChannel) {
			if (channel.snipedTimeout) this.client.clearTimeout(channel.snipedTimeout);

			channel.sniped = message;
			channel.snipedTimestamp = Date.now();
			channel.snipedTimeout = this.client.setTimeout(() => {
				channel.sniped = null;
				channel.snipedTimestamp = null;
				channel.snipedTimeout = null;
			}, 15000);
		}
	}

}
