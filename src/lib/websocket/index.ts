import WebSocket, { Server } from 'ws';
import http from 'http';
import { SkyraClient } from '../SkyraClient';
import Collection from '@discordjs/collection';
import { enumerable } from '../util/util';

import WebsocketUser from './WebsocketUser';
import { CloseCodes } from './types';

// TODO - should we timeout connections? disconnect after X period?
// TODO - after the connection of a WebsocketUser is closed, is that class instance GC'd? should be


export class WebsocketHandler {

	public wss: Server;
	public users = new Collection<string, WebsocketUser>();

	@enumerable(false)
	private client: SkyraClient;

	public constructor(client: SkyraClient) {
		this.client = client;
		this.wss = new Server({ port: 565 });

		this.wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
			// We've just gotten a new Websocket Connection
			const ip = req.connection.remoteAddress;

			// If they don't have a IP for some reason, close.
			if (!ip) return ws.close(CloseCodes.InternalError);

			// If they already have a connection with this IP, close.
			if (this.users.has(ip)) return ws.close(CloseCodes.PolicyViolation);

			// We have a new "user", add them to this.users
			const websocketUser = new WebsocketUser(this.client, this.wss, ws, ip);
			this.users.set(ip, websocketUser);


			ws.on('close', () => {
				ws.removeAllListeners('message');
				this.users.delete(ip);
			});
		});
	}

}
