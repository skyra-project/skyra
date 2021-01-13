import { GuildSettings } from '#lib/database';
import { SkyraEmbed } from '#lib/discord';
import { GuildMessage } from '#lib/types';
import { Colors } from '#lib/types/constants/Constants';
import { Events } from '#lib/types/Enums';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { MessageLogsEnum } from '#utils/constants';
import { escapeMarkdown } from '#utils/External/escapeMarkdown';
import { ApplyOptions } from '@skyra/decorators';
import { diffWordsWithSpace } from 'diff';
import { Message } from 'discord.js';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ event: Events.MessageUpdate })
export default class extends Event {
	public async run(old: Message, message: GuildMessage) {
		if (!message.guild || old.content === message.content || message.author.bot) return;

		const [enabled, ignoredChannels, ignoredEdits, ignoredAll, t] = await message.guild.readSettings((settings) => [
			settings[GuildSettings.Events.MessageEdit],
			settings[GuildSettings.Messages.IgnoreChannels],
			settings[GuildSettings.Channels.Ignore.MessageEdit],
			settings[GuildSettings.Channels.Ignore.All],
			settings.getLanguage()
		]);

		if (!enabled) return;
		if (ignoredChannels.includes(message.channel.id)) return;
		if (ignoredEdits.some((id) => id === message.channel.id || message.channel.parentID === id)) return;
		if (ignoredAll.some((id) => id === message.channel.id || message.channel.parentID === id)) return;

		this.client.emit(Events.GuildMessageLog, message.channel.nsfw ? MessageLogsEnum.NSFWMessage : MessageLogsEnum.Message, message.guild, () =>
			new SkyraEmbed()
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
				.setFooter(t(LanguageKeys.Events.MessageUpdate, { message }))
				.setTimestamp()
		);
	}
}
