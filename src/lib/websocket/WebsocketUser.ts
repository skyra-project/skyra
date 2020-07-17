/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { SkyraClient } from '@lib/SkyraClient';
import { UserAuthObject } from '@lib/structures/api/ApiRequest';
import { Events } from '@lib/types/Enums';
import { APIErrors } from '@utils/constants';
import { resolveOnErrorCodes } from '@utils/util';
import WebSocket, { Data } from 'ws';
import {
	CloseCodes, IncomingWebsocketAction, IncomingWebsocketMessage,
	MusicAction, OutgoingWebsocketAction, OutgoingWebsocketMessage,
	SubscriptionAction, SubscriptionName, WebsocketEvents
} from './types';
import { WebsocketSubscriptionStore } from './WebsocketSubscriptionStore';

export default class DashboardWebsocketUser {

	public client: SkyraClient;
	public musicSubscriptions = new WebsocketSubscriptionStore();

	#auth: UserAuthObject;
	#connection: WebSocket;

	public constructor(client: SkyraClient, connection: WebSocket, auth: UserAuthObject) {
		this.client = client;
		this.#connection = connection;
		this.#auth = auth;

		// When the connection for this user receives a Raw Websocket message...
		this.#connection.on(WebsocketEvents.Message, this.handleIncomingRawMessage.bind(this));
	}

	public send(message: OutgoingWebsocketMessage) {
		this.#connection.send(JSON.stringify(message));
	}

	public error(message: string) {
		this.send({ error: message });
	}

	private async handleMusicMessage(message: IncomingWebsocketMessage) {
		// Check if the message is well-formed:
		if (!message.data.music_action
			|| !message.data.guild_id
			|| !this.musicSubscriptions.subscribed(message.data.guild_id)) return;

		// Check for the existence of the guild:
		const guild = this.client.guilds.get(message.data.guild_id);
		if (!guild) {
			this.musicSubscriptions.unsubscribe(message.data.guild_id);
			this.send({ action: OutgoingWebsocketAction.MusicWebsocketDisconnect, data: { id: message.data.guild_id } });
			return;
		}

		// Check for the existence of the member:
		const member = await resolveOnErrorCodes(guild.members.fetch(this.#auth.user_id), APIErrors.UnknownMember);
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

			const guild = this.client.guilds.get(message.data.guild_id);
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
				this.handleMusicMessage(message).catch(err => this.client.emit(Events.Wtf, err));
				break;
			}
			case IncomingWebsocketAction.SubscriptionUpdate: {
				this.handleSubscriptionUpdate(message);
				break;
			}
		}
	}

	private handleIncomingRawMessage(rawMessage: Data) {
		try {
			const parsedMessage: IncomingWebsocketMessage = JSON.parse(rawMessage as string);
			this.handleMessage(parsedMessage);
		} catch {
			// They've sent invalid JSON, close the connection.
			this.#connection.close(CloseCodes.ProtocolError);
		}
	}

}
