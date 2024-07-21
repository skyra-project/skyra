import { readSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { GuildMessage } from '#lib/types';
import { Colors } from '#utils/constants';
import { formatMessage, formatTimestamp } from '#utils/formatters';
import { getLogger } from '#utils/functions/guild';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import type { TFunction } from '@sapphire/plugin-i18next';
import {
	AttachmentBuilder,
	GatewayDispatchEvents,
	SnowflakeUtil,
	channelMention,
	messageLink,
	userMention,
	type GatewayMessageDeleteBulkDispatchData,
	type GuildTextBasedChannel,
	type Snowflake
} from 'discord.js';

@ApplyOptions<Listener.Options>({ event: GatewayDispatchEvents.MessageDeleteBulk, emitter: 'ws' })
export class UserListener extends Listener {
	public async run(data: GatewayMessageDeleteBulkDispatchData) {
		if (!data.guild_id) return;

		const guild = this.container.client.guilds.cache.get(data.guild_id);
		if (!guild) return;

		const logger = getLogger(guild);

		const channel = guild.channels.cache.get(data.channel_id) as GuildTextBasedChannel;
		if (!channel) return logger.prune.unset(data.channel_id);

		const messages = data.ids.map((id) => ({ id, message: channel.messages.cache.get(id) ?? null }) as BulkMessageEntry);
		const contextPromise = logger.prune.wait(data.channel_id);

		const settings = await readSettings(guild);
		await logger.send({
			key: 'channelsLogsPrune',
			channelId: settings.channelsLogsPrune,
			condition: () =>
				!settings.messagesIgnoreChannels.some((id) => id === channel.id || channel.parentId === id) ||
				!settings.channelsIgnoreMessageDeletes.some((id) => id === channel.id && channel.parentId === id) ||
				!settings.channelsIgnoreAll.some((id) => id === channel.id || channel.parentId === id),
			makeMessage: async () => {
				const t = settings.getLanguage();
				const context = await contextPromise;
				const description = context
					? t(LanguageKeys.Events.Messages.MessageDeleteBulk, {
							author: userMention(context.userId),
							channel: channelMention(channel.id),
							count: messages.length
						})
					: t(LanguageKeys.Events.Messages.MessageDeleteBulkUnknown, {
							channel: channelMention(channel.id),
							count: messages.length
						});

				const embed = new EmbedBuilder()
					.setFooter({ text: t(LanguageKeys.Events.Messages.MessageDeleteBulkFooter) })
					.setDescription(description)
					.setColor(Colors.Brown)
					.setTimestamp();

				return { embeds: [embed], files: [this.generateAttachment(t, channel.id, guild.id, messages)] };
			},
			onAbort: () => logger.prune.unset(data.channel_id)
		});
	}

	private generateAttachment(t: TFunction, channelId: Snowflake, guildId: Snowflake, messages: readonly BulkMessageEntry[]) {
		const header = t(LanguageKeys.Commands.Moderation.PruneLogHeader);
		const processed = messages
			.map((entry) =>
				entry.message
					? formatMessage(t, entry.message)
					: `${formatTimestamp(t, SnowflakeUtil.timestampFrom(entry.id))} ${messageLink(channelId, entry.id, guildId)}`
			)
			.reverse()
			.join('\n\n');

		const buffer = Buffer.from(`${header}\n\n${processed}`);
		return new AttachmentBuilder(buffer, { name: 'prune.txt' });
	}
}

interface BulkMessageEntry {
	id: string;
	message: GuildMessage | null;
}
