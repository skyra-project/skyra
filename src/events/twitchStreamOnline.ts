import ApiResponse from '@lib/structures/api/ApiResponse';
import { TwitchHelixGameSearchResult } from '@lib/types/definitions/Twitch';
import { GuildSettings, NotificationsStreamsTwitchEventStatus } from '@lib/types/settings/GuildSettings';
import { PostStreamBodyData } from '@root/routes/twitch/twitchStreamChange';
import { TWITCH_REPLACEABLES_MATCHES, TWITCH_REPLACEABLES_REGEX } from '@utils/Notifications/Twitch';
import { floatPromise } from '@utils/util';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Event } from 'klasa';
import * as util from 'util';

export default class extends Event {

	public async run(data: PostStreamBodyData, response: ApiResponse) {
		try {
			this.client.console.debug('>>> RUNNING TWITCH ONLINE EVENT, DATA IN ONLINE EVENT:');
			console.log(`TWITCHSTREAMONLINE.TS [${new Date().toISOString()}]`, util.inspect(data, { showHidden: true, depth: Infinity, maxArrayLength: Infinity }));

			// All streams should have a game_id.
			if (typeof data.game_id === 'undefined') return response.error('"game_id" field is not defined.');

			// Fetch the streamer, and if it could not be found, return error.
			const streamer = await this.client.queries.fetchTwitchStreamSubscription(data.user_id);
			this.client.console.debug('>>> Checking for streamers:');
			this.client.console.log(`TWITCHSTREAMONLINE.TS [${new Date().toISOString()}]`, util.inspect(streamer, { showHidden: true, depth: Infinity, maxArrayLength: Infinity }));
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
				this.client.console.log(`TWITCHSTREAMONLINE.TS [${new Date().toISOString()}]`, 'Got subscriptions from settings');
				this.client.console.log(`TWITCHSTREAMONLINE.TS [${new Date().toISOString()}]`, util.inspect(subscriptions, { showHidden: true, depth: Infinity, maxArrayLength: Infinity }));
				if (typeof subscriptions === 'undefined') continue;

				this.client.console.log(`TWITCHSTREAMONLINE.TS [${new Date().toISOString()}]`, 'About to iterate over subscriptions');
				// Iterate over each subscription
				for (const subscription of subscriptions[1]) {
					this.client.console.log(`TWITCHSTREAMONLINE.TS [${new Date().toISOString()}]`, 'Looping over subscriptions');
					if (subscription.status !== NotificationsStreamsTwitchEventStatus.Online) continue;
					this.client.console.log(`TWITCHSTREAMONLINE.TS [${new Date().toISOString()}]`, 'Passed the online status check');
					// if (subscription.gamesBlacklist.includes(game.name) || subscription.gamesBlacklist.includes(game.id)) continue;
					// if (subscription.gamesWhitelist.length && (!subscription.gamesWhitelist.includes(game.name) || !subscription.gamesWhitelist.includes(game.id))) continue;
					if (this.client.twitch.streamNotificationDrip(`${subscriptions[0]}-${subscription.channel}-${subscription.status}`)) continue;
					this.client.console.log(`TWITCHSTREAMONLINE.TS [${new Date().toISOString()}]`, 'Passed dripping the notification');

					// Retrieve the channel, then check if it exists or if it's postable.
					const channel = guild.channels.get(subscription.channel) as TextChannel | undefined;
					if (typeof channel === 'undefined' || !channel.postable) continue;

					// Retrieve the message and transform it, if no embed, return the basic message.
					const message = subscription.message === null ? undefined : this.transformText(subscription.message, data, game);
					this.client.console.log(`TWITCHSTREAMONLINE.TS [${new Date().toISOString()}]`, 'build up the message: ', message);
					if (subscription.embed === null) {
						this.client.console.log(`TWITCHSTREAMONLINE.TS [${new Date().toISOString()}]`, 'about to send the message');
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
		} catch (error) {
			this.client.console.error('>>>> TWITCH ONLINE CRASHED, ERROR:');
			this.client.console.error(error);
		}
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
