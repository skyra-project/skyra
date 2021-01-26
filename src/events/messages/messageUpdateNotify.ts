import { GuildSettings } from '#lib/database';
import { SkyraEmbed } from '#lib/discord';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types';
import { Colors } from '#lib/types/Constants';
import { Events } from '#lib/types/Enums';
import { MessageLogsEnum } from '#utils/constants';
import { escapeMarkdown } from '#utils/External/escapeMarkdown';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions } from '@sapphire/framework';
import { diffWordsWithSpace } from 'diff';
import type { Message } from 'discord.js';

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

		this.context.client.emit(
			Events.GuildMessageLog,
			message.channel.nsfw ? MessageLogsEnum.NSFWMessage : MessageLogsEnum.Message,
			message.guild,
			() =>
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
