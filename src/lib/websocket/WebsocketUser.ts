import { SkyraClient } from '@lib/SkyraClient';
import { UserAuthObject } from '@lib/structures/api/ApiRequest';
import { Events } from '@lib/types/Enums';
import WebSocket, { Data, Server } from 'ws';
import {
	CloseCodes,
	IncomingWebsocketAction, IncomingWebsocketMessage,
	MusicAction, MusicSubscription,
	OutgoingWebsocketAction, OutgoingWebsocketMessage, Subscription,
	SubscriptionAction, SubscriptionName, WebsocketEvents
} from './types';

export default class DashboardWebsocketUser {

	public IP: string;
	public authenticated = false;
	public auth: UserAuthObject;
	public wss: Server;
	public client: SkyraClient;
	public subscriptions: Subscription[] = [];

	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	#connection: WebSocket;

	public constructor(client: SkyraClient, wss: Server, connection: WebSocket, IP: string, auth: UserAuthObject) {
		this.#connection = connection;
		this.wss = wss;
		this.IP = IP;
		this.client = client;
		this.auth = auth;

		// When the connection for this user receives a Raw Websocket message...
		this.#connection.on(WebsocketEvents.Message, this.handleIncomingRawMessage.bind(this));
	}

	public send(message: OutgoingWebsocketMessage) {
		this.#connection.send(JSON.stringify(message));
	}

	public error(message: string) {
		this.send({ error: message });
	}

	public async canManageMusic(guildID: string) {
		const guild = this.client.guilds.get(guildID);
		if (!guild) return false;

		const member = await guild.members.fetch(this.auth.user_id);
		if (!member) return false;

		return member.isDJ;
	}

	public syncMusic() {
		for (const musicSubscription of this.subscriptions.filter(sub => sub.type === SubscriptionName.Music) as MusicSubscription[]) {
			const guild = this.client.guilds.get(musicSubscription.guild_id);
			if (!guild) continue;

			this.send({ action: OutgoingWebsocketAction.MusicSync, data: guild.music.toJSON() });
		}
	}

	public async handleMusicMessage(message: IncomingWebsocketMessage) {
		if (!message.data.music_action
			|| !message.data.guild_id
			|| !(await this.canManageMusic(message.data.guild_id))) return;

		const guild = this.client.guilds.get(message.data.guild_id);
		if (!guild) return;

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

	public subscribeToMusic(guild_id: string) {
		const guild = this.client.guilds.get(guild_id);
		if (!guild) return;

		const subscription: Subscription = {
			type: SubscriptionName.Music,
			guild_id
		};

		this.subscriptions.push(subscription);
		this.syncMusic();
	}

	public handleSubscriptionUpdate(message: IncomingWebsocketMessage) {
		if (!message.data.subscription_name || !message.data.subscription_action) return;

		switch (message.data.subscription_action) {
			case SubscriptionAction.Subscribe: {
				if (message.data.subscription_name === SubscriptionName.Music) {
					if (!message.data.guild_id) return;
					this.subscribeToMusic(message.data.guild_id);
				}
			}
			case SubscriptionAction.Unsubscribe: {
				break;
			}
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
