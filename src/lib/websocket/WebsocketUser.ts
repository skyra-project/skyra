/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { Events } from '@lib/types/Enums';
import { resolveOnErrorCodes } from '@utils/util';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';
import WebSocket, { Data } from 'ws';
import {
	CloseCodes,
	IncomingWebsocketAction,
	IncomingWebsocketMessage,
	MusicAction,
	OutgoingWebsocketAction,
	OutgoingWebsocketMessage,
	SubscriptionAction,
	SubscriptionName,
	WebsocketEvents
} from './types';
import type { WebsocketHandler } from './WebsocketHandler';
import { WebsocketSubscriptionStore } from './WebsocketSubscriptionStore';

export default class DashboardWebsocketUser {
	public musicSubscriptions = new WebsocketSubscriptionStore();
	public connection: WebSocket;

	#handler: WebsocketHandler;
	#userID: string;

	public constructor(handler: WebsocketHandler, connection: WebSocket, userID: string) {
		this.#handler = handler;
		this.#userID = userID;
		this.connection = connection;

		// Set up the event listeners
		this.connection.on(WebsocketEvents.Message, this.onMessage.bind(this));
		this.connection.once(WebsocketEvents.Close, this.onClose.bind(this));
	}

	public get client() {
		return this.#handler.client;
	}

	public send(message: OutgoingWebsocketMessage) {
		this.connection.send(JSON.stringify(message));
	}

	public error(message: string) {
		this.send({ error: message });
	}

	private async handleMusicMessage(message: IncomingWebsocketMessage) {
		// Check if the message is well-formed:
		if (!message.data.music_action || !message.data.guild_id || !this.musicSubscriptions.subscribed(message.data.guild_id)) return;

		// Check for the existence of the guild:
		const guild = this.client.guilds.cache.get(message.data.guild_id);
		if (!guild) {
			this.musicSubscriptions.unsubscribe(message.data.guild_id);
			this.send({ action: OutgoingWebsocketAction.MusicWebsocketDisconnect, data: { id: message.data.guild_id } });
			return;
		}

		// Check for the existence of the member:
		const member = await resolveOnErrorCodes(guild.members.fetch(this.#userID), RESTJSONErrorCodes.UnknownMember);
		if (!member) {
			this.musicSubscriptions.unsubscribe(message.data.guild_id);
			this.send({ action: OutgoingWebsocketAction.MusicWebsocketDisconnect, data: { id: message.data.guild_id } });
			return;
		}

		// Check for the member's permissions:
		if (!member.isDJ) return;

		switch (message.data.music_action) {
			case MusicAction.SkipSong: {
				await guild.music.skip().catch(() => null);
				break;
			}
			case MusicAction.PauseSong: {
				await guild.music.pause().catch(() => null);
				break;
			}
			case MusicAction.ResumePlaying: {
				await guild.music.resume().catch(() => null);
				break;
			}
			case MusicAction.AddSong:
			case MusicAction.DeleteSong: {
				break;
			}
		}
	}

	private handleSubscriptionUpdate(message: IncomingWebsocketMessage) {
		if (!message.data.subscription_name || !message.data.subscription_action) return;

		switch (message.data.subscription_action) {
			case SubscriptionAction.Subscribe:
				this.handleSubscribeMessage(message);
				break;
			case SubscriptionAction.Unsubscribe: {
				this.handleUnSubscribeMessage(message);
				break;
			}
		}
	}

	private handleSubscribeMessage(message: IncomingWebsocketMessage) {
		if (message.data.subscription_name === SubscriptionName.Music) {
			if (!message.data.guild_id) return;

			const guild = this.client.guilds.cache.get(message.data.guild_id);
			if (!guild) return;

			this.musicSubscriptions.subscribe({ id: guild.id });
			this.send({ action: OutgoingWebsocketAction.MusicSync, data: guild.music.toJSON() });
		}
	}

	private handleUnSubscribeMessage(message: IncomingWebsocketMessage) {
		if (message.data.guild_id && this.musicSubscriptions.unsubscribe(message.data.guild_id)) {
			this.send({ action: OutgoingWebsocketAction.MusicWebsocketDisconnect, data: { id: message.data.guild_id } });
		}
	}

	private handleMessage(message: IncomingWebsocketMessage) {
		switch (message.action) {
			case IncomingWebsocketAction.MusicQueueUpdate: {
				// TODO: Make this notify the user instead of silently failing
				this.handleMusicMessage(message).catch((err) => this.client.emit(Events.Wtf, err));
				break;
			}
			case IncomingWebsocketAction.SubscriptionUpdate: {
				this.handleSubscriptionUpdate(message);
				break;
			}
		}
	}

	private onMessage(rawMessage: Data) {
		try {
			const parsedMessage: IncomingWebsocketMessage = JSON.parse(rawMessage as string);
			this.handleMessage(parsedMessage);
		} catch {
			// They've sent invalid JSON, close the connection.
			this.connection.close(CloseCodes.ProtocolError);
		}
	}

	private onClose() {
		this.connection.removeAllListeners(WebsocketEvents.Message);

		// Only remove if the instance set is the same as this instance
		if (this.#handler.users.get(this.#userID) === this) this.#handler.users.delete(this.#userID);
	}
}
