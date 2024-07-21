import { GuildEntity, GuildSettings, readSettings } from '#lib/database';
import { getT } from '#lib/i18n';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { type GuildMessage } from '#lib/types';
import { escapeMarkdown } from '#utils/External/escapeMarkdown';
import { Colors } from '#utils/constants';
import { addAutomaticFields, getLogger } from '#utils/functions';
import { getFullEmbedAuthor } from '#utils/util';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { isNsfwChannel } from '@sapphire/discord.js-utilities';
import { Listener } from '@sapphire/framework';
import { isNullish, isNullishOrEmpty } from '@sapphire/utilities';
import { diffWordsWithSpace } from 'diff';
import {
	GatewayDispatchEvents,
	bold,
	messageLink,
	strikethrough,
	type APIUser,
	type GatewayMessageUpdateDispatchData,
	type GuildTextBasedChannel
} from 'discord.js';

@ApplyOptions<Listener.Options>({ event: GatewayDispatchEvents.MessageUpdate, emitter: 'ws' })
export class UserListener extends Listener {
	public async run(data: GatewayMessageUpdateDispatchData) {
		if (!data.guild_id) return;

		const guild = this.container.client.guilds.cache.get(data.guild_id);
		if (!guild) return;

		const channel = guild.channels.cache.get(data.channel_id) as GuildTextBasedChannel;
		if (!channel) return;

		const cachedMessage = channel.messages.cache.get(data.id) as GuildMessage | undefined;
		const oldContent = cachedMessage?.content;
		const currentContent = data.content ?? '';
		if ((cachedMessage && cachedMessage.content === currentContent) || data.webhook_id || !data.author) return;

		const key = GuildSettings.Channels.Logs[isNsfwChannel(channel) ? 'MessageUpdateNsfw' : 'MessageUpdate'];
		const settings = await readSettings(guild);
		await getLogger(guild).send({
			key,
			channelId: settings[key],
			condition: () => this.onCondition(cachedMessage, channel, data.author!, settings),
			makeMessage: () => {
				const t = getT(settings.language);
				const embed = new EmbedBuilder()
					.setColor(Colors.Amber)
					.setAuthor(getFullEmbedAuthor(data.author!, messageLink(data.channel_id, data.id)))
					.setTimestamp();

				if (isNullish(cachedMessage)) {
					addAutomaticFields(embed, currentContent) //
						.setFooter({ text: t(LanguageKeys.Events.Messages.MessageUpdateUnknown, { channel: `#${channel.name}` }) });
				} else {
					addAutomaticFields(embed, this.getMessageDifference(oldContent!, currentContent)) //
						.setFooter({ text: t(LanguageKeys.Events.Messages.MessageUpdate, { channel: `#${channel.name}` }) });
				}
				return embed;
			}
		});
	}

	private onCondition(cachedMessage: GuildMessage | undefined, channel: GuildTextBasedChannel, author: APIUser, settings: GuildEntity) {
		// If includeBots is false, and the message author is a bot, return false
		if (!settings.eventsIncludeBots && author.bot) return false;
		// If allowUnknownMessages is false, and the message is nullish, return false
		if (!settings.eventsUnknownMessages && isNullish(cachedMessage)) return false;
		// If the channel is in the ignoredChannels array, return false
		if (settings.messagesIgnoreChannels.includes(channel.id)) return false;
		// If the channel or its parent is in the ignoredEdits array, return false
		if (settings.channelsIgnoreMessageEdits.some((id) => id === channel.id || channel.parentId === id)) return false;
		// If the channel or its parent is in the ignoredAll array, return false
		if (settings.channelsIgnoreAll.some((id) => id === channel.id || channel.parentId === id)) return false;
		// All checks passed, return true
		return true;
	}

	private getMessageDifference(old: string, current: string) {
		const oldEmpty = isNullishOrEmpty(old);
		const currentEmpty = isNullishOrEmpty(current);

		// If both are empty, return an empty string
		if (oldEmpty && currentEmpty) return '';
		// If it went from empty to not empty, return the current bolded
		if (oldEmpty && !currentEmpty) return bold(current);
		// If it went from not empty to empty, return the old strikethrough
		if (!oldEmpty && currentEmpty) return strikethrough(old);
		// If both are not empty, return the difference
		return diffWordsWithSpace(escapeMarkdown(old), escapeMarkdown(current))
			.map((result) => (result.added ? bold(result.value) : result.removed ? strikethrough(result.value) : result.value))
			.join(' ');
	}
}
