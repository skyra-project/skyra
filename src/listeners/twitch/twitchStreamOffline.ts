import { GuildSettings, NotificationsStreamsTwitchEventStatus, readSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { TwitchEventSubOnlineOfflineEvent, TwitchSubscriptionTypes } from '#lib/types';
import { Events } from '#lib/types/Enums';
import { floatPromise } from '#utils/common';
import { ApplyOptions } from '@sapphire/decorators';
import { canSendMessages } from '@sapphire/discord.js-utilities';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { ApiResponse } from '@sapphire/plugin-api';
import { MessageEmbed, TextChannel } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<ListenerOptions>({
	event: Events.TwitchStreamOffline
})
export class UserListener extends Listener {
	public async run(data: TwitchEventSubOnlineOfflineEvent, response: ApiResponse) {
		// Fetch the streamer, and if it could not be found, return error.
		const { twitchStreamSubscriptions } = this.container.db;
		const streamer = await twitchStreamSubscriptions.findOne({
			id: data.broadcaster_user_id,
			subscriptionType: TwitchSubscriptionTypes.StreamOffline
		});
		if (!streamer) return response.error('No streamer could be found in the database.');

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
				if (subscription.status !== NotificationsStreamsTwitchEventStatus.Offline) continue;
				if (this.container.client.twitch.streamNotificationDrip(`${subscriptions[0]}-${subscription.channel}-${subscription.status}`))
					continue;

				// Retrieve the channel, then check if it exists or if it's postable.
				const channel = guild.channels.cache.get(subscription.channel) as TextChannel | undefined;
				if (channel === undefined || !canSendMessages(channel)) continue;

				// If the message could not be retrieved then skip this notification.
				if (subscription.message) {
					floatPromise(channel.send({ embeds: [this.buildEmbed(subscription.message, t)] }));
				}

				break;
			}
		}

		return response.ok();
	}

	private buildEmbed(message: string, t: TFunction) {
		return new MessageEmbed()
			.setColor(this.container.client.twitch.BRANDING_COLOUR)
			.setDescription(message)
			.setFooter(t(LanguageKeys.Events.Twitch.EmbedFooter))
			.setTimestamp();
	}
}
