import WebSocket, { Server, Data } from 'ws';
import * as http from 'http';
import { SkyraClient } from '../SkyraClient';
import Collection from '@discordjs/collection';
import { enumerable } from '../util/util';

export const enum IncomingWebsocketAction {
	Authenticate = 'AUTHENTICATE',
	MusicQueueUpdate = 'MUSIC_QUEUE_UPDATE'
}

export const enum CloseCodes {
	ProtocolError = 1002,
	PolicyViolation = 1008,
	InternalError = 1011,
	AuthorizationFailed = 4301,
	AuthorizationSuccess = 4320
}

export interface IncomingWebsocketMessage {
	action: IncomingWebsocketAction;
	data: unknown;
}

export interface OutgoingWebsocketMessage {
	action?: IncomingWebsocketAction;
	data?: unknown;
	error?: string;
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

		// When the connection for this user receives a Raw Websocket message...
		this._connection.on('message', this.handleIncomingRawMessage.bind(this));
	}

	public send(message: OutgoingWebsocketMessage) {
		this._connection.send(JSON.stringify(message));
	}

	public error(message: string) {
		this.send({ error: message });
	}

	private handleMessage(message: IncomingWebsocketMessage) {
		// this.client.webSocketEvents.get(message.action).run(message);

		switch (message.action) {
			case IncomingWebsocketAction.Authenticate: {
				// If they're already authenticated, or didn't send a token, close.
				if (this.authenticated || !(message.data as UserAuthObject).token) {
					return this._connection.close(CloseCodes.AuthorizationFailed);
				}

				// here we decrypt message.data.token and auth like in KDH

				return this._connection.close(CloseCodes.AuthorizationSuccess);
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
			if (!ip) return ws.close(CloseCodes.InternalError);

			// If they already have a connection with this IP, close.
			if (this.users.has(ip)) return ws.close(CloseCodes.PolicyViolation);

			// We have a new "user", add them to this.users
			const websocketUser = new DashboardWebsocketUser(this.client, this.wss, ws, ip);
			this.users.set(ip, websocketUser);


			ws.on('close', () => {
				ws.removeAllListeners('message');
				this.users.delete(ip);
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
