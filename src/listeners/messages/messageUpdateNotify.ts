import { GuildSettings, readSettings } from '#lib/database';
import { SkyraEmbed } from '#lib/discord';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Events } from '#lib/types';
import { isGuildMessage } from '#utils/common';
import { Colors } from '#utils/constants';
import { escapeMarkdown } from '#utils/External/escapeMarkdown';
import { getFullEmbedAuthor } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { isNsfwChannel } from '@sapphire/discord.js-utilities';
import { Listener } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { diffWordsWithSpace } from 'diff';
import type { Message } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: Events.MessageUpdate })
export class UserListener extends Listener {
	public async run(old: Message, message: Message) {
		if (!isGuildMessage(message) || old.content === message.content || message.author.bot) return;

		const key = GuildSettings.Channels.Logs[isNsfwChannel(message.channel) ? 'MessageUpdateNsfw' : 'MessageUpdate'];
		const [ignoredChannels, logChannelId, ignoredEdits, ignoredAll, t] = await readSettings(message.guild, (settings) => [
			settings[GuildSettings.Messages.IgnoreChannels],
			settings[key],
			settings[GuildSettings.Channels.Ignore.MessageEdit],
			settings[GuildSettings.Channels.Ignore.All],
			settings.getLanguage()
		]);

		if (isNullish(logChannelId)) return;
		if (ignoredChannels.includes(message.channel.id)) return;
		if (ignoredEdits.some((id) => id === message.channel.id || message.channel.parentId === id)) return;
		if (ignoredAll.some((id) => id === message.channel.id || message.channel.parentId === id)) return;

		this.container.client.emit(Events.GuildMessageLog, message.guild, logChannelId, key, () =>
			new SkyraEmbed()
				.setColor(Colors.Amber)
				.setAuthor(getFullEmbedAuthor(message.author, message.url))
				.splitFields(
					diffWordsWithSpace(escapeMarkdown(old.content), escapeMarkdown(message.content))
						.map((result) => (result.added ? `**${result.value}**` : result.removed ? `~~${result.value}~~` : result.value))
						.join(' ')
				)
				.setFooter({ text: t(LanguageKeys.Events.Messages.MessageUpdate, { channel: `#${message.channel.name}` }) })
				.setTimestamp()
		);
	}
}
