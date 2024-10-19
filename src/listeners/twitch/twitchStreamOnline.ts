import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Events } from '#lib/types';
import { escapeMarkdown } from '#utils/External/escapeMarkdown';
import { floatPromise } from '#utils/common';
import { streamNotificationDrip } from '#utils/twitch';
import { extractDetailedMentions } from '#utils/util';
import { EmbedBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { canSendMessages, type TextBasedChannelTypes } from '@sapphire/discord.js-utilities';
import { Listener } from '@sapphire/framework';
import type { TFunction } from '@sapphire/plugin-i18next';
import { fetchT } from '@sapphire/plugin-i18next';
import { isNullish } from '@sapphire/utilities';
import {
	fetchStream,
	TwitchBrandingColor,
	TwitchEventSubTypes,
	type TwitchEventSubOnlineEvent,
	type TwitchHelixStreamsResult,
	type TwitchOnlineEmbedData
} from '@skyra/twitch-helpers';

@ApplyOptions<Listener.Options>({
	event: Events.TwitchStreamOnline
})
export class UserListener extends Listener<Events.TwitchStreamOnline> {
	private readonly kTwitchImageReplacerRegex = /({width}|{height})/gi;

	public async run(data: TwitchEventSubOnlineEvent) {
		const twitchSubscription = await this.container.prisma.twitchSubscription.findFirst({
			where: {
				streamerId: data.broadcaster_user_id,
				subscriptionType: 'StreamOnline'
			},
			include: { guildSubscription: true }
		});

		if (twitchSubscription) {
			try {
				// Get the data for this stream from the Twitch API
				const streamData = await fetchStream(data.broadcaster_user_id);

				// Iterate over all the guilds that are subscribed to this streamer and subscription type
				for (const guildSubscription of twitchSubscription.guildSubscription) {
					if (
						streamNotificationDrip(`${twitchSubscription.streamerId}-${guildSubscription.channelId}-${TwitchEventSubTypes.StreamOnline}`)
					) {
						continue;
					}

					// Retrieve the guild, if not found, skip to the next loop cycle.
					const guild = this.container.client.guilds.cache.get(guildSubscription.guildId);
					if (typeof guild === 'undefined') continue;

					// Retrieve the language for this guild
					const t = await fetchT(guild);

					// Retrieve the channel to send the message to
					const channel = guild.channels.cache.get(guildSubscription.channelId) as TextBasedChannelTypes;
					if (isNullish(channel) || !canSendMessages(channel) || channel.isDMBased()) {
						continue;
					}

					// Construct a message embed and send it.
					const detailedMentions = extractDetailedMentions(guildSubscription.message);

					floatPromise(
						channel.send({
							content: guildSubscription.message || undefined,
							embeds: [this.buildEmbed(this.transformTextToObject(data, streamData), t)],
							allowedMentions: { parse: detailedMentions.parse, users: [...detailedMentions.users], roles: [...detailedMentions.roles] }
						})
					);
				}
			} catch {
				// noop, this try/catch is only here so we don't get a runtime error.
			}
		}
	}

	private transformTextToObject(notification: TwitchEventSubOnlineEvent, streamData: TwitchHelixStreamsResult | null): TwitchOnlineEmbedData {
		return {
			embedThumbnailUrl: streamData?.game_box_art_url?.replace(this.kTwitchImageReplacerRegex, '128'),
			gameName: streamData?.game_name,
			language: streamData?.language,
			startedAt: new Date(notification.started_at),
			title: this.escapeText(streamData?.title),
			userName: notification.broadcaster_user_name,
			viewerCount: streamData?.viewer_count,
			embedImageUrl: streamData?.thumbnail_url.replace(this.kTwitchImageReplacerRegex, '128')
		};
	}

	private buildEmbed(data: TwitchOnlineEmbedData, t: TFunction) {
		const embed = new EmbedBuilder()
			.setTitle(data.title)
			.setURL(`https://twitch.tv/${data.userName}`)
			.setFooter({ text: t(LanguageKeys.Events.Twitch.OfflinePostfix) })
			.setColor(TwitchBrandingColor)
			.setTimestamp(data.startedAt);

		if (data.gameName) {
			embed.setDescription(t(LanguageKeys.Events.Twitch.EmbedDescriptionWithGame, { userName: data.userName, gameName: data.gameName }));
		} else {
			embed.setDescription(t(LanguageKeys.Events.Twitch.EmbedDescription, { userName: data.userName }));
		}

		if (data.embedImageUrl) {
			embed.setImage(data.embedImageUrl);
		}

		if (data.embedThumbnailUrl) {
			embed.setThumbnail(data.embedThumbnailUrl ?? '');
		}

		return embed;
	}

	private escapeText(text?: string) {
		if (isNullish(text)) {
			return '';
		}

		return escapeMarkdown(text.replace(/\\/g, '\\\\').replace(/"/g, '\\"'));
	}
}
