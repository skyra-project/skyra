import { DbSet, GuildSettings, NotificationsStreamsTwitchEventStatus } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { TwitchHelixGameSearchResult } from '#lib/types/definitions/Twitch';
import type { PostStreamBodyData } from '#root/routes/twitch/twitchStreamChange';
import { escapeMarkdown } from '#utils/External/escapeMarkdown';
import { TWITCH_REPLACEABLES_MATCHES, TWITCH_REPLACEABLES_REGEX } from '#utils/Notifications/Twitch';
import { floatPromise } from '#utils/util';
import { Event } from '@sapphire/framework';
import { ApiResponse } from '@sapphire/plugin-api';
import { MessageEmbed, TextChannel } from 'discord.js';
import type { TFunction } from 'i18next';

export default class extends Event {
	private readonly kTwitchImageReplacerRegex = /({width}|{height})/gi;

	public async run(data: PostStreamBodyData, response: ApiResponse) {
		// All streams should have a game_id.
		if (typeof data.game_id === 'undefined') return response.error('"game_id" field is not defined.');

		// Fetch the streamer, and if it could not be found, return error.
		const { twitchStreamSubscriptions } = await DbSet.connect();
		const streamer = await twitchStreamSubscriptions.findOne({ id: data.user_id });
		if (!streamer) return response.error('No streamer could be found in the database.');

		const {
			data: [game]
		} = await this.context.client.twitch.fetchGame([data.game_id]);
		// Iterate over all the guilds that are subscribed to the streamer.
		for (const guildID of streamer.guildIds) {
			// Retrieve the guild, if not found, skip to the next loop cycle.
			const guild = this.context.client.guilds.cache.get(guildID);
			if (typeof guild === 'undefined') continue;

			// Synchronize the settings, then retrieve to all of its subscriptions
			const [allSubscriptions, t] = await guild.readSettings((settings) => [
				settings[GuildSettings.Notifications.Stream.Twitch.Streamers],
				settings.getLanguage()
			]);

			const subscriptions = allSubscriptions.find(([id]) => id === streamer.id);
			if (typeof subscriptions === 'undefined') continue;

			// Iterate over each subscription
			for (const subscription of subscriptions[1]) {
				if (subscription.status !== NotificationsStreamsTwitchEventStatus.Online) continue;
				if (game !== undefined) {
					if (subscription.gamesBlacklist.includes(game.name) || subscription.gamesBlacklist.includes(game.id)) continue;
					if (
						subscription.gamesWhitelist.length &&
						(!subscription.gamesWhitelist.includes(game.name) || !subscription.gamesWhitelist.includes(game.id))
					)
						continue;
				}
				if (this.context.client.twitch.streamNotificationDrip(`${subscriptions[0]}-${subscription.channel}-${subscription.status}`)) continue;

				// Retrieve the channel, then check if it exists or if it's postable.
				const channel = guild.channels.cache.get(subscription.channel) as TextChannel | undefined;
				if (typeof channel === 'undefined' || !channel.postable) continue;

				// If the message could not be retrieved then skip this notification.
				if (subscription.message !== null) {
					if (subscription.embed) {
						const embedData = this.transformTextToObject(data, game);

						// Construct a message embed and send it.
						floatPromise(channel.send(this.buildEmbed(embedData, t)));
					} else {
						const message = this.transformTextToString(subscription.message, data, t, game);
						floatPromise(channel.send(message));
					}
				}

				break;
			}
		}

		return response.ok();
	}

	private transformTextToString(source: string, notification: PostStreamBodyData, t: TFunction, game?: TwitchHelixGameSearchResult) {
		return source.replace(TWITCH_REPLACEABLES_REGEX, (match) => {
			switch (match) {
				case TWITCH_REPLACEABLES_MATCHES.ID:
					return notification.id;
				case TWITCH_REPLACEABLES_MATCHES.TITLE:
					return this.escapeText(notification.title);
				case TWITCH_REPLACEABLES_MATCHES.VIEWER_COUNT:
					return notification.viewer_count.toString();
				case TWITCH_REPLACEABLES_MATCHES.GAME_NAME:
					return game?.name ?? t(LanguageKeys.Notifications.TwitchNoGameName);
				case TWITCH_REPLACEABLES_MATCHES.LANGUAGE:
					return notification.language;
				case TWITCH_REPLACEABLES_MATCHES.GAME_ID:
					return notification.game_id;
				case TWITCH_REPLACEABLES_MATCHES.USER_ID:
					return notification.user_id;
				case TWITCH_REPLACEABLES_MATCHES.USER_NAME:
					return this.escapeText(notification.user_name);
				default:
					return match;
			}
		});
	}

	private transformTextToObject(notification: PostStreamBodyData, game?: TwitchHelixGameSearchResult): TwitchOnlineEmbedData {
		return {
			user_name: notification.user_name,
			title: this.escapeText(notification.title),
			started_at: new Date(notification.started_at),
			viewer_count: notification.viewer_count.toString(),
			language: notification.language,
			thumbnail_url: notification.thumbnail_url.replace(this.kTwitchImageReplacerRegex, '128'),
			type: notification.type,
			game_name: game?.name,
			box_art_url: game?.box_art_url?.replace(this.kTwitchImageReplacerRegex, '1024'),
			tag_ids: notification.tag_ids,
			user_id: notification.user_id
		};
	}

	private buildEmbed(data: TwitchOnlineEmbedData, t: TFunction) {
		return new MessageEmbed()
			.setThumbnail(data.thumbnail_url)
			.setTitle(data.title)
			.setURL(`https://twitch.tv/${data.user_name}`)
			.setDescription(
				data.game_name
					? t(LanguageKeys.Notifications.TwitchEmbedDescriptionWithGame, { userName: data.user_name, gameName: data.game_name })
					: t(LanguageKeys.Notifications.TwitchEmbedDescription, { userName: data.user_name })
			)
			.setFooter(t(LanguageKeys.Notifications.TwitchEmbedFooter))
			.setTimestamp(data.started_at)
			.setColor(this.context.client.twitch.BRANDING_COLOUR)
			.setImage(data.box_art_url ?? '');
	}

	private escapeText(text: string) {
		return escapeMarkdown(text.replace(/\\/g, '\\\\').replace(/"/g, '\\"'));
	}
}

type TwitchOnlineEmbedData = Omit<PostStreamBodyData, 'id' | 'viewer_count' | 'started_at' | 'game_id'> &
	Omit<Partial<TwitchHelixGameSearchResult>, 'id' | 'name'> & {
		viewer_count: string;
		started_at: Date;
		game_name: string | undefined;
	};
