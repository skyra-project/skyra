import { Empty } from 'google-protobuf/google/protobuf/empty_pb';
import type * as Shared from '../generated/shared_pb';
import { YoutubeSubscriptionClient } from '../generated/youtube_subscription_grpc_pb';
import * as YoutubeSubscription from '../generated/youtube_subscription_pb';
import { ClientHandler } from './base/ClientHandler';

export class YoutubeSubscriptionHandler extends ClientHandler {
	public readonly client = new YoutubeSubscriptionClient(ClientHandler.address, ClientHandler.getCredentials());

	public manageSubscription(options: YoutubeSubscriptionHandler.SubscriptionManageQuery) {
		const query = new YoutubeSubscription.SubscriptionManageQuery()
			.setChannelUrl(options.channelUrl)
			.setGuildId(options.guildId)
			.setNotificationMessage(options.notificationMessage)
			.setGuildChannelId(options.guildChannelId)
			.setType(options.type);
		return this.makeCall<YoutubeSubscriptionHandler.Result>((cb) => this.client.manageSubscription(query, cb));
	}

	// TODO: Uncomment once `SubscriptionResult` gets `status`.
	// public getSubscriptions() {
	// 	const query = new Empty();
	// 	return this.makeCall<YoutubeSubscriptionHandler.SubscriptionResult>((cb) => this.client.getSubscriptions(query, cb));
	// }

	public updateSubscriptionSettings(options: YoutubeSubscriptionHandler.NotificationUpdateRequest) {
		const query = new YoutubeSubscription.NotificationSettingsUpdate()
			.setMessage(options.message)
			.setGuildId(options.guildId)
			.setChannel(options.channel);
		return this.makeCall<YoutubeSubscriptionHandler.Result>((cb) => this.client.updateSubscriptionSettings(query, cb));
	}

	public subscriptionNotifications() {
		return this.makeStream<YoutubeSubscription.Subscription>(this.client.subscriptionNotifications(new Empty()));
	}
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace YoutubeSubscriptionHandler {
	export type SubscriptionManageQuery = YoutubeSubscription.SubscriptionManageQuery.AsObject;
	export type NotificationUpdateRequest = YoutubeSubscription.NotificationSettingsUpdate.AsObject;
	export type Result = Shared.Result.AsObject;
	export type SubscriptionResult = YoutubeSubscription.SubscriptionResult.AsObject;
	export type Subscription = YoutubeSubscription.Subscription.AsObject;
	export type SubscriptionNotificationStream = YoutubeSubscription.SubscriptionNotification.AsObject;
}
