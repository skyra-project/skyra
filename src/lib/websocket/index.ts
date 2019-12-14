import WebSocket, { Server, Data } from 'ws';
import * as http from 'http';
import { SkyraClient } from '../SkyraClient';
import Collection from '@discordjs/collection';
import { enumerable } from '../util/util';

export const enum IncomingWebsocketAction {
	Authenticate = 'AUTHENTICATE',
	MusicQueueUpdate = 'MUSIC_QUEUE_UPDATE'
}

export interface IncomingWebsocketMessage {
	action: IncomingWebsocketAction;
	data: any;
}

export interface OutgoingWebsocketMessage {
	action: IncomingWebsocketAction;
	data: any;
}

export interface UserAuthObject {
	user_id: number;
	token: string;
}

export class DashboardWebsocketUser {

	public IP: string;
	public authenticated = false;
	public hasDjRole = false;
	public auth?: UserAuthObject;
	public wss: Server;
	public client: SkyraClient;

	@enumerable(false)
	private _connection: WebSocket;

	public constructor(client: SkyraClient, wss: Server, connection: WebSocket, IP: string) {
		this._connection = connection;
		this.wss = wss;
		this.IP = IP;
		this.client = client;

		// ??
		this._connection.once('close', () => {
			this._connection.removeListener('message', this.handleIncomingRawMessage.bind(this));
		});
	}

	public send(message: OutgoingWebsocketMessage) {
		this._connection.send(JSON.stringify(message));
	}

	private handleMessage(message: IncomingWebsocketMessage) {
		// this.client.webSocketEvents.get(message.action).run(message);

		switch (message.action) {
			case IncomingWebsocketAction.Authenticate: {
				if (!message.data || !message.data.token) {
					return this._connection.close(4000);
				}

				return this._connection.close(4000);
			}

		}
	}

	private handleIncomingRawMessage(rawMessage: Data) {
		const parsedMessage: IncomingWebsocketMessage = JSON.parse(rawMessage as string);
		this.handleMessage(parsedMessage);
	}

}

export class WebsocketHandler {

	public wss: Server;
	public users = new Collection<string, DashboardWebsocketUser>();

	@enumerable(false)
	private client: SkyraClient;

	public constructor(client: SkyraClient) {
		this.client = client;
		this.wss = new Server({ port: 443 });

		this.wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
			// We've just gotten a new Websocket Connection
			const ip = req.connection.remoteAddress;

			// If they don't have a IP for some reason, close.
			if (!ip) return ws.close(1011);

			// If they already have a connection with this IP, close.
			if (this.users.has(ip)) return ws.close(1008);

			// We have a new "user", add them to this.users
			const websocketUser = new DashboardWebsocketUser(client, this.wss, ws, ip);
			this.users.set(ip, websocketUser);


			ws.on('close', () => {
				this.users.delete(ip);
				websocketUser._connection.removeAllListeners('message');
			});
		});
	}


}


/*
setInterval(requestHostSync, 5000);

function websocketBroadcast(data: any) {
	for (const id of Object.keys(connections)) {
		if (!connections[id].isAuthenticated) {
			console.log(`Not sending message to ${id} because they're not authenticated.`);
			continue;
		}
		connections[id].send(JSON.stringify(data));
	}
}
*/
