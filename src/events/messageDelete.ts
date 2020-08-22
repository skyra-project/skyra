import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { Colors } from '@lib/types/constants/Constants';
import { Events } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { cutText } from '@sapphire/utilities';
import { MessageLogsEnum } from '@utils/constants';
import { getContent, getImage } from '@utils/util';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Event, KlasaMessage } from 'klasa';

export default class extends Event {
	public run(message: KlasaMessage) {
		if (message.partial || !message.guild || message.author.bot) return;

		this.handleUserRichDisplay(message);
		this.handleMessageLogs(message);
		this.handleSnipeMessage(message);
	}

	private handleUserRichDisplay(message: KlasaMessage) {
		const handler = UserRichDisplay.messages.get(message.id);
		if (handler) handler.stop();
	}

	private handleMessageLogs(message: KlasaMessage) {
		const enabled = message.guild!.settings.get(GuildSettings.Events.MessageDelete);
		const ignoreChannels = message.guild!.settings.get(GuildSettings.Messages.IgnoreChannels);
		const ignoreDeletes = message
			.guild!.settings.get(GuildSettings.Channels.Ignore.MessageDelete)
			.some((id) => message.channel.id === id || (message.channel as TextChannel).parent?.id === id);
		const ignoreAllEvents = message
			.guild!.settings.get(GuildSettings.Channels.Ignore.All)
			.some((id) => message.channel.id === id || (message.channel as TextChannel).parent?.id === id);
		if (!enabled || ignoreChannels.includes(message.channel.id) || ignoreDeletes || ignoreAllEvents) return;

		const channel = message.channel as TextChannel;
		this.client.emit(Events.GuildMessageLog, channel.nsfw ? MessageLogsEnum.NSFWMessage : MessageLogsEnum.Message, message.guild, () =>
			new MessageEmbed()
				.setColor(Colors.Red)
				.setAuthor(
					`${message.author.tag} (${message.author.id})`,
					message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true })
				)
				.setDescription(cutText(getContent(message) || '', 1900))
				.setFooter(`${message.language.get('eventsMessageDelete')} • ${channel.name}`)
				.setImage(getImage(message)!)
				.setTimestamp()
		);
	}

	private handleSnipeMessage(message: KlasaMessage) {
		if (message.channel instanceof TextChannel) message.channel.sniped = message;
	}
}
