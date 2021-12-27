import { envParseString } from '#lib/env';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { CustomGet } from '#lib/types';
import type { ClientReadableStream } from '@grpc/grpc-js';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';
import { YoutubeSubscriptionClient } from '../../generated/youtube_subscription_grpc_pb';
import * as Youtube from '../../generated/youtube_subscription_pb';
import { ClientHandler } from '../base/ClientHandler';

export class YoutubeServiceHandler extends ClientHandler {
	public readonly client = new YoutubeSubscriptionClient(envParseString('GRPC_NOTIFICATIONS_ADDRESS'), ClientHandler.getCredentials());
	private notificationStream: ClientReadableStream<Youtube.UploadNotification> | null = null;

	public handleStatusCode(status: Youtube.YoutubeServiceResult): CustomGet<string, string> {
		return YoutubeServiceHandler.statuses[status];
	}

	public subscribe(options: YoutubeServiceHandler.SubscriptionRequest): Promise<YoutubeServiceHandler.YoutubeServiceResponse> {
		const query = new Youtube.SubscriptionRequest().setGuildId(options.guildId).setChannelUrl(options.channelUrl);
		return this.makeCall<YoutubeServiceHandler.YoutubeServiceResponse>((cb) => this.client.subscribe(query, cb));
	}

	public unsubscribe(options: YoutubeServiceHandler.SubscriptionRequest): Promise<YoutubeServiceHandler.YoutubeServiceResponse> {
		const query = new Youtube.SubscriptionRequest().setGuildId(options.guildId).setChannelUrl(options.channelUrl);
		return this.makeCall<YoutubeServiceHandler.YoutubeServiceResponse>((cb) => this.client.unsubscribe(query, cb));
	}

	public setDiscordUploadChannel(options: YoutubeServiceHandler.DiscordChannelRequest): Promise<YoutubeServiceHandler.YoutubeServiceResponse> {
		const query = new Youtube.DiscordChannelRequest().setGuildId(options.guildId).setChannelId(options.channelId);
		return this.makeCall<YoutubeServiceHandler.YoutubeServiceResponse>((cb) => this.client.setDiscordUploadChannel(query, cb));
	}

	public setDiscordLiveChannel(options: YoutubeServiceHandler.DiscordChannelRequest): Promise<YoutubeServiceHandler.YoutubeServiceResponse> {
		const query = new Youtube.DiscordChannelRequest().setGuildId(options.guildId).setChannelId(options.channelId);
		return this.makeCall<YoutubeServiceHandler.YoutubeServiceResponse>((cb) => this.client.setDiscordLiveChannel(query, cb));
	}

	public setDiscordUploadMessage(options: YoutubeServiceHandler.DiscordMessageRequest): Promise<YoutubeServiceHandler.YoutubeServiceResponse> {
		const query = new Youtube.DiscordMessageRequest().setGuildId(options.guildId).setContent(options.content);
		return this.makeCall<YoutubeServiceHandler.YoutubeServiceResponse>((cb) => this.client.setDiscordUploadMessage(query, cb));
	}

	public setDiscordLiveMessage(options: YoutubeServiceHandler.DiscordMessageRequest): Promise<YoutubeServiceHandler.YoutubeServiceResponse> {
		const query = new Youtube.DiscordMessageRequest().setGuildId(options.guildId).setContent(options.content);
		return this.makeCall<YoutubeServiceHandler.YoutubeServiceResponse>((cb) => this.client.setDiscordLiveMessage(query, cb));
	}

	public async *getNotificationStream(): AsyncGenerator<YoutubeServiceHandler.UploadNotification, void, void> {
		this.notificationStream?.cancel();

		const query = new Empty();

		this.notificationStream = this.client.notificationStream(query);
		for await (const value of this.notificationStream) {
			yield (value as Youtube.UploadNotification).toObject();
		}
	}

	public getSubscriptions(options: YoutubeServiceHandler.SubscriptionListRequest): Promise<YoutubeServiceHandler.SubscriptionListResponse> {
		const query = new Youtube.SubscriptionListRequest().setGuildId(options.guildId);
		return this.makeCall<YoutubeServiceHandler.SubscriptionListResponse>((cb) => this.client.getSubscriptions(query, cb));
	}

	public removeAllSubscriptions(options: YoutubeServiceHandler.RemoveAllRequest): Promise<YoutubeServiceHandler.YoutubeServiceResponse> {
		const query = new Youtube.RemoveAllRequest().setGuildId(options.guildId);
		return this.makeCall<YoutubeServiceHandler.YoutubeServiceResponse>((cb) => this.client.removeAllSubscriptions(query, cb));
	}

	public dispose() {
		this.notificationStream?.cancel();
		this.client.close();
	}

	private static readonly statuses = [
		null, //
		LanguageKeys.Services.YoutubeFailure,
		LanguageKeys.Services.YoutubeNotConfigured,
		LanguageKeys.Services.YoutubeIncorrectChannelInfo
	] as CustomGet<string, string>[];
}

export namespace YoutubeServiceHandler {
	export type SubscriptionRequest = Youtube.SubscriptionRequest.AsObject;
	export type DiscordChannelRequest = Youtube.DiscordChannelRequest.AsObject;
	export type DiscordMessageRequest = Youtube.DiscordMessageRequest.AsObject;
	export type SubscriptionListRequest = Youtube.SubscriptionListRequest.AsObject;
	export type RemoveAllRequest = Youtube.RemoveAllRequest.AsObject;

	export type YoutubeServiceResponse = Youtube.YoutubeServiceResponse.AsObject;
	export type UploadNotification = Youtube.UploadNotification.AsObject;
	export type SubscriptionListResponse = Youtube.SubscriptionListResponse.AsObject;

	export type GuildInformation = Youtube.GuildInformation.AsObject;
	export type Video = Youtube.Video.AsObject;
	export type ChannelInformation = Youtube.ChannelInformation.AsObject;
}
