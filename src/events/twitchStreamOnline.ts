import ApiResponse from '@lib/structures/api/ApiResponse';
import { TwitchHelixGameSearchResult } from '@lib/types/definitions/Twitch';
import { GuildSettings, NotificationsStreamsTwitchEventStatus } from '@lib/types/settings/GuildSettings';
import { PostStreamBodyData } from '@root/routes/twitch/twitchStreamChange';
import { TWITCH_REPLACEABLES_MATCHES, TWITCH_REPLACEABLES_REGEX } from '@utils/Notifications/Twitch';
import { floatPromise } from '@utils/util';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Event, Language } from 'klasa';
import * as util from 'util';

export default class extends Event {

	// private kThumbnailReplacerRegex = /({width}|{height})/i;

	public async run(data: PostStreamBodyData, response: ApiResponse) {
		// All streams should have a game_id.
		if (typeof data.game_id === 'undefined') return response.error('"game_id" field is not defined.');

		// Fetch the streamer, and if it could not be found, return error.
		const streamer = await this.client.queries.fetchTwitchStreamSubscription(data.user_id);
		if (streamer === null) return response.error('No streamer could be found in the database.');

		const { data: [game] } = await this.client.twitch.fetchGame([data.game_id]);
		this.client.console.log(`TWITCHSTREAMONLINE.TS [${new Date().toISOString()}]`, 'Logging game data');
		this.client.console.debug(`TWITCHSTREAMONLINE.TS [${new Date().toISOString()}]`, util.inspect(game, { showHidden: true, depth: Infinity, maxArrayLength: Infinity }));
		// Iterate over all the guilds that are subscribed to the streamer.
		for (const guildID of streamer.guild_ids) {
			// Retrieve the guild, if not found, skip to the next loop cycle.
			const guild = this.client.guilds.get(guildID);
			if (typeof guild === 'undefined') continue;

			// Synchronize the settings, then retrieve to all of its subscriptions
			await guild.settings.sync();
			const subscriptions = guild.settings.get(GuildSettings.Notifications.Streams.Twitch.Streamers)
				.find(([id]) => id === streamer.id);
			if (typeof subscriptions === 'undefined') continue;

			// Iterate over each subscription
			for (const subscription of subscriptions[1]) {
				if (subscription.status !== NotificationsStreamsTwitchEventStatus.Online) continue;
				if (game !== undefined) {
					if (subscription.gamesBlacklist.includes(game.name) || subscription.gamesBlacklist.includes(game.id)) continue;
					if (subscription.gamesWhitelist.length && (!subscription.gamesWhitelist.includes(game.name) || !subscription.gamesWhitelist.includes(game.id))) continue;
				}
				if (this.client.twitch.streamNotificationDrip(`${subscriptions[0]}-${subscription.channel}-${subscription.status}`)) continue;

				// Retrieve the channel, then check if it exists or if it's postable.
				const channel = guild.channels.get(subscription.channel) as TextChannel | undefined;
				if (typeof channel === 'undefined' || !channel.postable) continue;

				// Retrieve the message and transform it, if the message could not be retrieved then skip this notification.
				const message = subscription.message === null ? undefined : this.transformText(subscription.message, data, guild.language, game);
				if (message === undefined) break;

				this.client.console.log(`TWITCHSTREAMONLINE.TS [${new Date().toISOString()}]`, 'PARSED MESSAGE');
				this.client.console.debug(`TWITCHSTREAMONLINE.TS [${new Date().toISOString()}]`, util.inspect(JSON.parse(message), { showHidden: true, depth: Infinity, maxArrayLength: Infinity }));
				this.client.console.debug(`TWITCHSTREAMONLINE.TS [${new Date().toISOString()}]`, 'LOGGING SUBSCRIPTION', util.inspect(subscription, { showHidden: true, depth: Infinity, maxArrayLength: Infinity }));
				if (subscription.embed) {
					// Construct a message embed and send it.
					floatPromise(this, channel.sendEmbed(this.buildEmbed(JSON.parse(message))));
					break;
				}

				floatPromise(this, channel.send(message));
				break;
			}
		}

		return response.ok();
	}

	private transformText(source: string, notification: PostStreamBodyData, i18n: Language, game?: TwitchHelixGameSearchResult) {
		return source.replace(TWITCH_REPLACEABLES_REGEX, match => {
			switch (match) {
				case TWITCH_REPLACEABLES_MATCHES.ID: return notification.id;
				case TWITCH_REPLACEABLES_MATCHES.TITLE: return this.escapeText(notification.title);
				case TWITCH_REPLACEABLES_MATCHES.VIEWER_COUNT: return notification.viewer_count.toString();
				case TWITCH_REPLACEABLES_MATCHES.GAME_NAME: return game?.name ?? i18n.tget('SYSTEM_TWITCH_NO_GAME_NAME');
				case TWITCH_REPLACEABLES_MATCHES.LANGUAGE: return notification.language;
				case TWITCH_REPLACEABLES_MATCHES.GAME_ID: return notification.game_id;
				case TWITCH_REPLACEABLES_MATCHES.USER_ID: return notification.user_id;
				case TWITCH_REPLACEABLES_MATCHES.USER_NAME: return this.escapeText(notification.user_name);
				default: return match;
			}
		});
	}

	// FIXME: Implement
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private buildEmbed(_data: any) {
		const embed = new MessageEmbed();
		// 	.setThumbnail(notification.thumbnail_url.replace(this.kThumbnailReplacerRegex, '128'))
		// 	.setTitle(`Streaming: `)
		// 	.setTimestamp(new Date(notification.started_at));

		// if (parsedMessage !== undefined) embed.setDescription(parsedMessage);

		return embed;
	}

	private escapeText(text: string) {
		return text.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
	}

}

// type TwitchOnlineEmbedData =
// 	& Omit<PostStreamBodyData, 'id' | 'viewer_count'>
// 	& Omit<TwitchHelixGameSearchResult, 'id'>
// 	& {
// 		stream_id: string;
// 		game_id: string;
// 		game_name: string;
// 		viewer_count: string;
// 	};
