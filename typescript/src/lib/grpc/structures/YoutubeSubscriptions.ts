import { Empty } from 'google-protobuf/google/protobuf/empty_pb';
import type * as Shared from '../generated/shared_pb';
import { YoutubeSubscriptionClient } from '../generated/youtube_subscription_grpc_pb';
import * as YoutubeSubscription from '../generated/youtube_subscription_pb';
import { ClientHandler } from './base/ClientHandler';

export class YoutubeSubscriptionHandler extends ClientHandler {
	public readonly client = new YoutubeSubscriptionClient(ClientHandler.address, ClientHandler.getCredentials());

	public manageSubscription(options: YoutubeSubscriptionHandler.NotificationManageQuery) {
		const query = new YoutubeSubscription.SubscriptionManageQuery()
			.setYoutubeChannelUrl(options.youtubeChannelUrl)
			.setGuildId(options.guildId)
			.setNotificationMessage(options.notificationMessage)
			.setGuildChannelId(options.guildChannelId)
			.setType(options.type);
		return this.makeCall<YoutubeSubscriptionHandler.Result>((cb) => this.client.manageSubscription(query, cb));
	}

	public getSubscriptions(options: YoutubeSubscriptionHandler.SubscriptionsQuery) {
		const query = new YoutubeSubscription.GetSubscriptionsQuery().setGuildId(options.guildId);
		return this.makeCall<YoutubeSubscriptionHandler.SubscriptionResult>((cb) => this.client.getSubscriptions(query, cb));
	}

	public updateSubscriptionSettings(options: YoutubeSubscriptionHandler.NotificationUpdateQuery) {
		const query = new YoutubeSubscription.NotificationSettingsUpdateQuery()
			.setMessage(options.message)
			.setGuildId(options.guildId)
			.setDiscordChannelId(options.discordChannelId);
		return this.makeCall<YoutubeSubscriptionHandler.Result>((cb) => this.client.updateSubscriptionSettings(query, cb));
	}

	public subscriptionNotifications() {
		return this.makeStream<YoutubeSubscriptionHandler.SubscriptionNotificationResult>(this.client.subscriptionNotifications(new Empty()));
	}
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace YoutubeSubscriptionHandler {
	export type NotificationManageQuery = YoutubeSubscription.SubscriptionManageQuery.AsObject;
	export type NotificationUpdateQuery = YoutubeSubscription.NotificationSettingsUpdateQuery.AsObject;
	export type SubscriptionsQuery = YoutubeSubscription.GetSubscriptionsQuery.AsObject;
	export type Result = Shared.Result.AsObject;
	export type SubscriptionResult = YoutubeSubscription.SubscriptionListResult.AsObject;
	export type Subscription = YoutubeSubscription.Subscription.AsObject;
	export type SubscriptionNotificationResult = YoutubeSubscription.SubscriptionNotificationResult.AsObject;
	export const { Action } = YoutubeSubscription;
}
