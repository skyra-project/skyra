import { Event } from 'klasa';
import { PostStreamBodyData } from '../routes/twitch/twitchStreamChange';
import { TwitchHelixGameSearchResult } from '../lib/types/definitions/Twitch';
import { TWITCH_REPLACEABLES_MATCHES, TWITCH_REPLACEABLES_REGEX } from '../lib/util/Notifications/Twitch';
import { GuildSettings, NotificationsStreamsTwitchEventStatus } from '../lib/types/settings/GuildSettings';
import { TextChannel, MessageEmbed } from 'discord.js';
import ApiResponse from '../lib/structures/api/ApiResponse';
import { floatPromise } from '../lib/util/util';

export default class extends Event {

	public async run(data: PostStreamBodyData, response: ApiResponse) {
		// All streams should have a game_id.
		if (typeof data.game_id === 'undefined') return response.error('"game_id" field is not defined.');

		// Fetch the streamer, and if it could not be found, return error.
		const streamer = await this.client.queries.fetchTwitchStreamSubscription(data.id);
		if (streamer === null) return response.error('No streamer could be found in the database.');

		const { data: [game] } = await this.client.twitch.fetchGame([data.game_id]);
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
				if (subscription.gamesBlacklist.includes(game.name) || subscription.gamesBlacklist.includes(game.id)) continue;
				if (subscription.gamesWhitelist.length && (!subscription.gamesWhitelist.includes(game.name) || !subscription.gamesWhitelist.includes(game.id))) continue;
				if (this.client.twitch.streamNotificationDrip(`${subscriptions[0]}-${subscription.channel}-${subscription.status}`)) continue;

				// Retrieve the channel, then check if it exists or if it's postable.
				const channel = guild.channels.get(subscription.channel) as TextChannel | undefined;
				if (typeof channel === 'undefined' || !channel.postable) continue;

				// Retrieve the message and transform it, if no embed, return the basic message.
				const message = subscription.message === null ? undefined : this.transformText(subscription.message, data, game);
				if (subscription.embed === null) {
					floatPromise(this, channel.send(message));
					break;
				}

				// Construct a message embed and send it.
				const embed = new MessageEmbed(JSON.parse(this.transformText(subscription.embed, data, game)));
				floatPromise(this, channel.send(message, embed));
				break;
			}
		}

		return response.ok();
	}

	private transformText(source: string, notification: PostStreamBodyData, game: TwitchHelixGameSearchResult) {
		return source.replace(TWITCH_REPLACEABLES_REGEX, match => {
			switch (match) {
				case TWITCH_REPLACEABLES_MATCHES.ID: return notification.id;
				case TWITCH_REPLACEABLES_MATCHES.TITLE: return this.escapeText(notification.title);
				case TWITCH_REPLACEABLES_MATCHES.VIEWER_COUNT: return notification.viewer_count.toString();
				case TWITCH_REPLACEABLES_MATCHES.GAME_NAME: return game.name;
				case TWITCH_REPLACEABLES_MATCHES.LANGUAGE: return notification.language;
				case TWITCH_REPLACEABLES_MATCHES.GAME_ID: return notification.game_id;
				case TWITCH_REPLACEABLES_MATCHES.USER_ID: return notification.user_id;
				case TWITCH_REPLACEABLES_MATCHES.USER_NAME: return this.escapeText(notification.user_name);
				default: return match;
			}
		});
	}

	private escapeText(text: string) {
		return text.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
	}

}
