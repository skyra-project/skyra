import { Action, YoutubeSubscriptionHandler } from '#lib/grpc';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { Events } from '#lib/types/Enums';
import { enabled } from '#utils/youtube';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions } from '@sapphire/framework';
import type { NewsChannel, TextChannel } from 'discord.js';
import type { TFunction } from 'i18next';

type Notification = YoutubeSubscriptionHandler.SubscriptionNotificationResult;
type Entry = Notification['channelsList'][number];
type Keys = 'video' | `video.${'id' | 'title' | 'thumbnail' | 'published-at'}` | 'channel' | `channel.${'id' | 'name' | 'url'}`;

@ApplyOptions<EventOptions>({ enabled })
export class UserEvent extends Event<Events.YoutubeNotification> {
	private readonly regExp = /{(?:video(?:\.(?:id|title|thumbnail|published-at))?|channel(?:\.(?:id|name|url))?)}/g;
	public async run(notification: Notification) {
		for (const entry of notification.channelsList) {
			await this.handleEntry(entry, notification);
		}
	}

	private async handleEntry(entry: Entry, notification: Notification) {
		const guild = this.context.client.guilds.cache.get(entry.guildId);
		if (!guild) return;

		const channel = guild.channels.cache.get(entry.discordChannelId) as TextChannel | NewsChannel | undefined;
		if (!channel) {
			try {
				await this.context.grpc.youtubeSubscriptions.manageSubscription({
					guildId: entry.guildId,
					guildChannelId: entry.discordChannelId,
					notificationMessage: '',
					type: Action.UNSUBSCRIBE,
					// TODO: I need the YT channel ID/URL
					youtubeChannelUrl: notification.videoId
				});
			} catch (error) {
				this.context.logger.fatal(error);
			}

			return;
		}

		if (!channel.postable) return;

		const t = await guild.fetchT();
		try {
			const content = this.format(entry, notification, t);
			await channel.send(content);
		} catch (error) {
			this.context.logger.fatal(error);
		}
	}

	private format(entry: Entry, notification: Notification, t: TFunction) {
		return entry.content.replace(this.regExp, (_, value) => {
			switch (value as Keys) {
				case 'video':
					return `https://youtu.be/${notification.videoId}`;
				case 'video.id':
					return notification.videoId;
				case 'video.title':
					return notification.videoTitle;
				case 'video.thumbnail':
					return notification.thumbnailUrl;
				case 'video.published-at':
					return notification.publishedAt === undefined
						? t(LanguageKeys.Globals.Unknown)
						: t(LanguageKeys.Globals.DateTimeValue, { value: notification.publishedAt.seconds * 1000 });
				case 'channel': {
					// TODO: I need the Youtube channel ID
					throw new Error('Not implemented yet: "channel" case');
				}
				case 'channel.id': {
					// TODO: I need the Youtube channel ID
					throw new Error('Not implemented yet: "channel.id" case');
				}
				case 'channel.name':
					return notification.youtubeChannelName;
				case 'channel.url': {
					// TODO: I need the Youtube channel ID
					throw new Error('Not implemented yet: "channel.url" case');
				}
			}
		});
	}
}
