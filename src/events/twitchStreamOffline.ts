import ApiResponse from '@lib/structures/api/ApiResponse';
import { GuildSettings, NotificationsStreamsTwitchEventStatus } from '@lib/types/settings/GuildSettings';
import { PostStreamBodyData } from '@root/routes/twitch/twitchStreamChange';
import { TWITCH_REPLACEABLES_MATCHES, TWITCH_REPLACEABLES_REGEX } from '@utils/Notifications/Twitch';
import { floatPromise } from '@utils/util';
import { MessageEmbed, TextChannel } from 'discord.js';
import { Event } from 'klasa';

export default class extends Event {

	public async run(data: PostStreamBodyData, response: ApiResponse) {
		// Fetch the streamer, and if it could not be found, return error.
		const streamer = await this.client.queries.fetchTwitchStreamSubscription(data.id);
		if (streamer === null) return response.error('No streamer could be found in the database.');

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
				if (subscription.status !== NotificationsStreamsTwitchEventStatus.Offline) continue;
				if (this.client.twitch.streamNotificationDrip(`${subscriptions[0]}-${subscription.channel}-${subscription.status}`)) continue;

				// Retrieve the channel, then check if it exists or if it's postable.
				const channel = guild.channels.get(subscription.channel) as TextChannel | undefined;
				if (typeof channel === 'undefined' || !channel.postable) continue;

				// Retrieve the message and transform it, if the message could not be retrieved then skip this notification.
				const message = subscription.message === null ? undefined : this.transformText(subscription.message, data);
				if (message === undefined) break;

				if (subscription.embed) {
					// Construct a message embed and send it.
					floatPromise(this, channel.sendEmbed(this.buildEmbed(JSON.parse(message))));
					break;
				}

				// Send the message without embed
				floatPromise(this, channel.send(message));
				break;
			}
		}

		return response.ok();
	}

	private transformText(str: string, notification: PostStreamBodyData) {
		return str.replace(TWITCH_REPLACEABLES_REGEX, match => {
			switch (match) {
				case TWITCH_REPLACEABLES_MATCHES.ID: return notification.id;
				default: return match;
			}
		});
	}

	// FIXME: Implement
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private buildEmbed(_data: any) {
		return new MessageEmbed();
	}

}
