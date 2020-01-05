import WebSocket, { Server } from 'ws';
import { SkyraClient } from '@lib/SkyraClient';
import { enumerable } from '@utils/util';

import WebsocketUser from './WebsocketUser';
import { WSS_PORT } from '@root/config';

// TODO (Magnaboy): Should we timeout connections? disconnect after X period?
export class WebsocketHandler {

	public wss: Server;
	public users = new Set<WebsocketUser>();

	@enumerable(false)
	private readonly client: SkyraClient;

	public constructor(client: SkyraClient) {
		this.client = client;
		this.wss = new Server({ port: WSS_PORT });

		this.wss.on('connection', (ws: WebSocket) => {
			// We have a new "user", add them to this.users
			const user = new WebsocketUser(this.client, this.wss, ws);
			this.users.add(user);

			ws.once('close', () => {
				ws.removeAllListeners('message');
				this.users.delete(user);
			});
		});
	}

}
