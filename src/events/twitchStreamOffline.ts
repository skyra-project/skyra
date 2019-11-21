import { Event } from 'klasa';
import { StreamBody } from '../routes/twitch/twitchStreamChange';
import { TWITCH_REPLACEABLES_MATCHES, TWITCH_REPLACEABLES_REGEX } from '../lib/util/Notifications/Twitch';
import { TextChannel, MessageEmbed } from 'discord.js';
import { GuildSettings, NotificationsStreamsTwitchEventStatus } from '../lib/types/settings/GuildSettings';
import ApiResponse from '../lib/structures/api/ApiResponse';

export default class extends Event {

	public async run(data: StreamBody, response: ApiResponse) {
		const streamer = await this.client.queries.fetchTwitchStreamSubscription(data.id);

		if (!streamer) return response.error('Streamer not found!');

		for (const guildID of streamer.guild_ids) {
			if (!this.client.guilds.has(guildID)) continue;

			const guild = this.client.guilds.get(guildID);
			await guild?.settings.sync();
			const allGuildSubscriptions = guild?.settings.get(GuildSettings.Notifications.Streams.Twitch.Streamers);
			const guildSubscriptions = allGuildSubscriptions!.find(value => value[0] === streamer.id);

			for (const sub of guildSubscriptions![1]) {
				if (this.client.twitch.streamNotificationLimited(sub.$ID)) continue;
				if (sub.status !== NotificationsStreamsTwitchEventStatus.Offline) continue;

				const channel = guild?.channels.get(sub.channel) as TextChannel;
				if (!channel.postable) continue;
				const message = this.transformText(sub.message, data);

				if (this.client.twitch.streamNotificationDrip(sub.$ID)) continue;

				if (sub.embed) {
					const embed = new MessageEmbed(JSON.parse(this.transformText(sub.embed, data)));
					return channel.send(message, embed);
				}
				return channel.send(message);
			}
		}
	}

	private transformText(str: string, notification: StreamBody) {
		return str.replace(TWITCH_REPLACEABLES_REGEX, match => {
			switch (match) {
				case TWITCH_REPLACEABLES_MATCHES.ID: return notification.id!;
				default: return match;
			}
		});
	}

}
