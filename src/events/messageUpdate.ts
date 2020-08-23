import { Colors } from '@lib/types/constants/Constants';
import { Events } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { MessageLogsEnum } from '@utils/constants';
import { escapeMarkdown } from '@utils/External/escapeMarkdown';
import { diffWordsWithSpace } from 'diff';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Event, KlasaMessage } from 'klasa';

export default class extends Event {
	public run(old: KlasaMessage, message: KlasaMessage) {
		if (!this.client.ready || !message.guild || old.content === message.content || message.author.bot) return;

		const enabled = message.guild.settings.get(GuildSettings.Events.MessageEdit);
		const ignoreChannels = message.guild.settings.get(GuildSettings.Messages.IgnoreChannels);
		const ignoreEdits = message
			.guild!.settings.get(GuildSettings.Channels.Ignore.MessageEdit)
			.some((id) => message.channel.id === id || (message.channel as TextChannel).parent?.id === id);
		const ignoreAllEvents = message
			.guild!.settings.get(GuildSettings.Channels.Ignore.All)
			.some((id) => message.channel.id === id || (message.channel as TextChannel).parent?.id === id);
		if (!enabled || ignoreChannels.includes(message.channel.id) || ignoreEdits || ignoreAllEvents) return;

		this.client.emit(
			Events.GuildMessageLog,
			(message.channel as TextChannel).nsfw ? MessageLogsEnum.NSFWMessage : MessageLogsEnum.Message,
			message.guild,
			() =>
				new MessageEmbed()
					.setColor(Colors.Amber)
					.setAuthor(
						`${message.author.tag} (${message.author.id})`,
						message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }),
						message.url
					)
					.splitFields(
						diffWordsWithSpace(escapeMarkdown(old.content), escapeMarkdown(message.content))
							.map((result) => (result.added ? `**${result.value}**` : result.removed ? `~~${result.value}~~` : result.value))
							.join(' ')
					)
					.setFooter(`${message.language.get('eventsMessageUpdate')} | ${(message.channel as TextChannel).name}`)
					.setTimestamp()
		);
	}
}
