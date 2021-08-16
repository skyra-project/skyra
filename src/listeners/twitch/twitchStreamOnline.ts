// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { GuildSettings, NotificationsStreamsTwitchEventStatus, readSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { TwitchEventSubTypes } from '#lib/types';
import type { TwitchEventSubOnlineEvent, TwitchHelixStreamsResult, TwitchOnlineEmbedData } from '#lib/types/definitions/Twitch';
import { Events } from '#lib/types/Enums';
import { floatPromise } from '#utils/common';
import { escapeMarkdown } from '#utils/External/escapeMarkdown';
import { ApplyOptions } from '@sapphire/decorators';
import { canSendMessages } from '@sapphire/discord.js-utilities';
import { Listener, ListenerOptions } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { MessageEmbed, TextChannel } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<ListenerOptions>({
	event: Events.TwitchStreamOnline
})
export class UserListener extends Listener<Events.TwitchStreamOnline> {
	private readonly kTwitchImageReplacerRegex = /({width}|{height})/gi;

	public async run(data: TwitchEventSubOnlineEvent) {
		// Fetch the streamer, and if it could not be found, return error.
		const { twitchStreamSubscriptions } = this.container.db;
		const streamer = await twitchStreamSubscriptions.findOne({
			id: data.broadcaster_user_id,
			subscriptionType: TwitchEventSubTypes.StreamOnline
		});

		if (streamer) {
			try {
				const streamData = await this.container.client.twitch.fetchStream(data.broadcaster_user_id);

				// Iterate over all the guilds that are subscribed to the streamer.
				for (const guildId of streamer.guildIds) {
					// Retrieve the guild, if not found, skip to the next loop cycle.
					const guild = this.container.client.guilds.cache.get(guildId);
					if (typeof guild === 'undefined') continue;

					// Synchronize the settings, then retrieve to all of its subscriptions
					const [allSubscriptions, t] = await readSettings(guild, (settings) => [
						settings[GuildSettings.Notifications.Stream.Twitch.Streamers],
						settings.getLanguage()
					]);

					const subscriptions = allSubscriptions.find(([id]) => id === streamer.id);
					if (typeof subscriptions === 'undefined') continue;

					// Iterate over each subscription
					for (const subscription of subscriptions[1]) {
						if (subscription.status !== NotificationsStreamsTwitchEventStatus.Online) {
							continue;
						}

						if (this.container.client.twitch.streamNotificationDrip(`${subscriptions[0]}-${subscription.channel}-${subscription.status}`))
							continue;

						// Retrieve the channel, then check if it exists or if it's postable.
						const channel = guild.channels.cache.get(subscription.channel) as TextChannel | undefined;
						if (channel === undefined || !canSendMessages(channel)) continue;

						// Construct a message embed and send it.
						floatPromise(channel.send({ embeds: [this.buildEmbed(this.transformTextToObject(data, streamData), t)] }));

						break;
					}
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
		const embed = new MessageEmbed()
			.setTitle(data.title)
			.setURL(`https://twitch.tv/${data.userName}`)
			.setFooter(t(LanguageKeys.Events.Twitch.EmbedFooter))
			.setColor(this.container.client.twitch.BRANDING_COLOUR)
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
