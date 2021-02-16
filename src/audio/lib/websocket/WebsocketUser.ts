/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { resolveOnErrorCodes } from '#utils/util';
import { Store } from '@sapphire/framework';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';
import type WebSocket from 'ws';
import {
	CloseCodes,
	IncomingWebSocketAction,
	IncomingWebSocketMessage,
	MusicAction,
	OutgoingWebSocketAction,
	OutgoingWebSocketMessage,
	SubscriptionAction,
	SubscriptionName,
	WebSocketEvents
} from './Shared';
import type { WebsocketHandler } from './WebsocketHandler';
import { WebsocketSubscriptionStore } from './WebsocketSubscriptionStore';

export class WebsocketUser {
	public musicSubscriptions = new WebsocketSubscriptionStore();
	public connection: WebSocket;

	#handler: WebsocketHandler;
	#userID: string;

	public constructor(handler: WebsocketHandler, connection: WebSocket, userID: string) {
		this.#handler = handler;
		this.#userID = userID;
		this.connection = connection;

		// Set up the event listeners
		this.connection.on(WebSocketEvents.Message, this.onMessage.bind(this));
		this.connection.once(WebSocketEvents.Close, this.onClose.bind(this));
	}

	public get client() {
		return Store.injectedContext.client;
	}

	public send(message: OutgoingWebSocketMessage) {
		this.connection.send(JSON.stringify(message));
	}

	public error(message: string) {
		this.send({ error: message });
	}

	private async handleMusicMessage(message: IncomingWebSocketMessage) {
		// Check if the message is well-formed:
		if (!message.data.music_action || !message.data.guild_id || !this.musicSubscriptions.subscribed(message.data.guild_id)) return;

		// Check for the existence of the guild:
		const guild = this.client.guilds.cache.get(message.data.guild_id);
		if (!guild) {
			this.musicSubscriptions.unsubscribe(message.data.guild_id);
			this.send({ action: OutgoingWebSocketAction.MusicWebsocketDisconnect, data: { id: message.data.guild_id } });
			return;
		}

		// Check for the existence of the member:
		const member = await resolveOnErrorCodes(guild.members.fetch(this.#userID), RESTJSONErrorCodes.UnknownMember);
		if (!member) {
			this.musicSubscriptions.unsubscribe(message.data.guild_id);
			this.send({ action: OutgoingWebSocketAction.MusicWebsocketDisconnect, data: { id: message.data.guild_id } });
			return;
		}

		// Check for the member's permissions:
		if (!(await member.isDJ())) return;

		switch (message.data.music_action) {
			case MusicAction.SkipSong: {
				await guild.audio.next().catch(() => null);
				break;
			}
			case MusicAction.PauseSong: {
				await guild.audio.pause().catch(() => null);
				break;
			}
			case MusicAction.ResumePlaying: {
				await guild.audio.resume().catch(() => null);
				break;
			}
			case MusicAction.AddSong:
			case MusicAction.DeleteSong: {
				break;
			}
		}
	}

	private async handleSubscriptionUpdate(message: IncomingWebSocketMessage): Promise<void> {
		if (!message.data.subscription_name || !message.data.subscription_action) return;

		switch (message.data.subscription_action) {
			case SubscriptionAction.Subscribe:
				return this.handleSubscribeMessage(message);
			case SubscriptionAction.Unsubscribe: {
				return this.handleUnSubscribeMessage(message);
			}
		}
	}

	private async handleSubscribeMessage(message: IncomingWebSocketMessage) {
		if (message.data.subscription_name === SubscriptionName.Music) {
			if (!message.data.guild_id) return;

			const guild = this.client.guilds.cache.get(message.data.guild_id);
			if (!guild) return;

			this.musicSubscriptions.subscribe({ id: guild.id });

			const { audio } = guild;
			const [tracks, status, volume] = await Promise.all([audio.decodedTracks(), audio.nowPlaying(), audio.getVolume()]);
			const voiceChannel = audio.voiceChannelID;
			this.send({ action: OutgoingWebSocketAction.MusicSync, data: { id: message.data.guild_id, tracks, status, volume, voiceChannel } });
		}
	}

	private handleUnSubscribeMessage(message: IncomingWebSocketMessage) {
		if (message.data.guild_id && this.musicSubscriptions.unsubscribe(message.data.guild_id)) {
			this.send({ action: OutgoingWebSocketAction.MusicWebsocketDisconnect, data: { id: message.data.guild_id } });
		}
	}

	private async handleMessage(message: IncomingWebSocketMessage) {
		switch (message.action) {
			case IncomingWebSocketAction.MusicQueueUpdate: {
				// TODO(kyranet): Make this notify the user instead of silently failing
				try {
					return this.handleMusicMessage(message);
				} catch (err) {
					return this.client.logger.fatal(err);
				}
			}
			case IncomingWebSocketAction.SubscriptionUpdate: {
				return this.handleSubscriptionUpdate(message);
			}
		}
	}

	private async onMessage(rawMessage: WebSocket.Data) {
		try {
			const parsedMessage: IncomingWebSocketMessage = JSON.parse(rawMessage as string);
			await this.handleMessage(parsedMessage);
		} catch {
			// They've sent invalid JSON, close the connection.
			this.connection.close(CloseCodes.ProtocolError);
		}
	}

	private onClose() {
		this.connection.removeAllListeners(WebSocketEvents.Message);

		// Only remove if the instance set is the same as this instance
		if (this.#handler.users.get(this.#userID) === this) this.#handler.users.delete(this.#userID);
	}
}
