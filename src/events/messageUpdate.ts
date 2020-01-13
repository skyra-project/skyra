import { Events } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { MessageLogsEnum } from '@utils/constants';
import { diffWordsWithSpace } from 'diff';
import { MessageEmbed, TextChannel, Util } from 'discord.js';
import { Event, KlasaMessage } from 'klasa';
import { Colors } from '@lib/types/constants/Constants';

export default class extends Event {

	public run(old: KlasaMessage, message: KlasaMessage) {
		if (!this.client.ready || !message.guild || old.content === message.content || message.author.bot) return;

		const enabled = message.guild.settings.get(GuildSettings.Events.MessageEdit);
		const ignoreChannels = message.guild.settings.get(GuildSettings.Messages.IgnoreChannels);
		if (!enabled || ignoreChannels.includes(message.channel.id)) return;

		this.client.emit(Events.GuildMessageLog, (message.channel as TextChannel).nsfw ? MessageLogsEnum.NSFWMessage : MessageLogsEnum.Message, message.guild, () => new MessageEmbed()
			.setColor(Colors.Amber)
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL(), message.url)
			.splitFields(diffWordsWithSpace(Util.escapeMarkdown(old.content), Util.escapeMarkdown(message.content))
				.map(result => result.added ? `**${result.value}**` : result.removed ? `~~${result.value}~~` : result.value)
				.join(' '))
			.setFooter(`${message.language.tget('EVENTS_MESSAGE_UPDATE')} | ${(message.channel as TextChannel).name}`)
			.setTimestamp());
	}

}
