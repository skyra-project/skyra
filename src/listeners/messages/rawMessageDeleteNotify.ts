import { GuildSettings, readSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Colors } from '#utils/constants';
import { makeRow } from '#utils/deprecate';
import { getLogger } from '#utils/functions';
import { getContent, getFullEmbedAuthor, getImages, setMultipleEmbedImages } from '#utils/util';
import { ButtonBuilder, EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { isNsfwChannel } from '@sapphire/discord.js-utilities';
import { Listener } from '@sapphire/framework';
import type { TFunction } from '@sapphire/plugin-i18next';
import { cutText, isNullish, isNullishOrEmpty } from '@sapphire/utilities';
import { ButtonStyle, GatewayDispatchEvents, messageLink, type GatewayMessageDeleteDispatchData, type GuildTextBasedChannel } from 'discord.js';

@ApplyOptions<Listener.Options>({ event: GatewayDispatchEvents.MessageDelete, emitter: 'ws' })
export class UserListener extends Listener {
	public async run(data: GatewayMessageDeleteDispatchData) {
		if (!data.guild_id) return;

		const guild = this.container.client.guilds.cache.get(data.guild_id);
		if (!guild) return;

		const channel = guild.channels.cache.get(data.channel_id) as GuildTextBasedChannel;
		if (!channel) return;

		const message = channel.messages.cache.get(data.id);

		const key = GuildSettings.Channels.Logs[isNsfwChannel(channel) ? 'MessageDeleteNsfw' : 'MessageDelete'];
		const [allowUnknownMessages, ignoredChannels, logChannelId, ignoredDeletes, ignoredAll, t] = await readSettings(guild, (settings) => [
			settings[GuildSettings.Events.UnknownMessages],
			settings[GuildSettings.Messages.IgnoreChannels],
			settings[key],
			settings[GuildSettings.Channels.Ignore.MessageDelete],
			settings[GuildSettings.Channels.Ignore.All],
			settings.getLanguage()
		]);

		await getLogger(guild).send({
			key,
			channelId: logChannelId,
			condition: () =>
				!(!allowUnknownMessages && isNullish(message)) ||
				!ignoredChannels.includes(channel.id) ||
				!ignoredDeletes.some((id) => id === channel.id || channel.parentId === id) ||
				!ignoredAll.some((id) => id === channel.id || channel.parentId === id),
			makeMessage: () => {
				const embed = new EmbedBuilder().setColor(Colors.Red).setTimestamp();

				if (isNullish(message)) {
					return {
						embeds: [embed.setFooter({ text: t(LanguageKeys.Events.Messages.MessageDeleteUnknown, { channel: `#${channel.name}` }) })],
						components: [this.getJumpButton(t, channel.id, data.id)]
					};
				}

				embed
					.setAuthor(getFullEmbedAuthor(message.author, message.url))
					.setFooter({ text: t(LanguageKeys.Events.Messages.MessageDelete, { channel: `#${channel.name}` }) });

				const content = getContent(message);
				if (!isNullishOrEmpty(content)) embed.setDescription(cutText(content, 1900));

				return setMultipleEmbedImages(embed, getImages(message));
			}
		});
	}

	private getJumpButton(t: TFunction, channelId: string, messageId: string) {
		return makeRow(
			new ButtonBuilder()
				.setStyle(ButtonStyle.Link)
				.setURL(messageLink(channelId, messageId))
				.setLabel(t(LanguageKeys.Events.Messages.JumpToContext))
		);
	}
}
