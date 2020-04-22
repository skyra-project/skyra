import { SkyraClient } from '@lib/SkyraClient';
import { UserAuthObject } from '@lib/structures/api/ApiRequest';
import { Events } from '@lib/types/Enums';
import { CLIENT_SECRET } from '@root/config';
import { enumerable } from '@utils/util';
import { KlasaUser } from 'klasa';
import { Util } from 'klasa-dashboard-hooks';
import WebSocket, { Data, Server } from 'ws';
import {
	Subscription,
	OutgoingWebsocketMessage,
	SubscriptionName,
	MusicSubscription,
	OutgoingWebsocketAction,
	IncomingWebsocketMessage,
	MusicAction,
	CloseCodes,
	SubscriptionAction,
	IncomingWebsocketAction
} from './types';


export default class DashboardWebsocketUser {

	public IP: string;
	public authenticated = false;
	public auth?: UserAuthObject;
	public wss: Server;
	public client: SkyraClient;
	public user?: KlasaUser | null;
	public subscriptions: Subscription[] = [];

	@enumerable(false)
	private _connection: WebSocket;

	public constructor(client: SkyraClient, wss: Server, connection: WebSocket, IP: string) {
		this._connection = connection;
		this.wss = wss;
		this.IP = IP;
		this.client = client;
		this.user = null;

		// When the connection for this user receives a Raw Websocket message...
		this._connection.on('message', this.handleIncomingRawMessage.bind(this));
	}

	public send(message: OutgoingWebsocketMessage) {
		this._connection.send(JSON.stringify(message));
	}

	public error(message: string) {
		this.send({ error: message });
	}

	public async canManageMusic(guildID: string) {
		if (!this.user) return false;

		const guild = this.client.guilds.get(guildID);
		if (!guild) return false;

		const member = await guild.members.fetch(this.user.id);
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
			|| !this.user
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
		}
	}

	public async handleAuthenticationMessage(message: IncomingWebsocketMessage) {
		// If they're already authenticated, or didn't send a id/token, close.
		if (this.authenticated || !message.data || !message.data.token || !message.data.user_id) {
			return this._connection.close(CloseCodes.Unauthorized);
		}

		let decryptedAuth;
		try {
			decryptedAuth = Util.decrypt(message.data.token, CLIENT_SECRET);
		} catch {
			return this._connection.close(CloseCodes.Unauthorized);
		}

		if (!decryptedAuth.user_id || !decryptedAuth.token || decryptedAuth.user_id !== message.data.user_id) {
			return this._connection.close(CloseCodes.Unauthorized);
		}

		let user;
		try {
			user = await this.client.users.fetch(decryptedAuth.user_id);
			if (!user) throw null;
		} catch {
			return this._connection.close(CloseCodes.Unauthorized);
		}

		this.user = user;
		this.auth = decryptedAuth;
		this.authenticated = true;

		this.send({ success: true, action: OutgoingWebsocketAction.Authenticate });
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
		}
	}

	private handleMessage(message: IncomingWebsocketMessage) {

		switch (message.action) {
			case IncomingWebsocketAction.Authenticate: {
				this.handleAuthenticationMessage(message).catch(err => this.client.emit(Events.Wtf, err));
				break;
			}

			case IncomingWebsocketAction.MusicQueueUpdate: {
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
			this._connection.close(CloseCodes.ProtocolError);
		}

	}

}
