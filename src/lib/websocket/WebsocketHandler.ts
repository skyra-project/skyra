import { DEV, WSS_PORT } from '#root/config';
import Collection from '@discordjs/collection';
import { ApiRequest, CookieStore } from '@sapphire/plugin-api';
import { isObject } from '@sapphire/utilities';
import { Store } from 'klasa';
import WebSocket, { Server } from 'ws';
import { CloseCodes, WebsocketEvents } from './types';
import WebsocketUser from './WebsocketUser';

export class WebsocketHandler {
	public wss: Server;
	public users = new Collection<string, WebsocketUser>();

	public constructor() {
		this.wss = new Server({ port: WSS_PORT });

		this.wss.on(WebsocketEvents.Connection, this.handleConnection.bind(this));
	}

	private handleConnection(ws: WebSocket, request: ApiRequest) {
		// Read SKYRA_AUTH cookie
		const cookies = new CookieStore(request, null!, !DEV);
		const auth = cookies.get('SKYRA_AUTH');
		if (!auth) return ws.close(CloseCodes.Unauthorized);

		// Decrypt and validate
		const authData = Store.injectedContext.server.auth!.decrypt(auth);
		if (!isObject(authData) || !authData.id || !authData.token) return ws.close(CloseCodes.Unauthorized);

		// Retrieve the user ID
		const { id } = authData;

		// If they already have a connection with the same user ID, close the previous.
		const previous = this.users.get(id);
		if (previous) previous.connection.close(CloseCodes.DuplicatedConnection);

		// We have a new "user", add them to this.users
		const websocketUser = new WebsocketUser(this, ws, id);
		this.users.set(id, websocketUser);
	}
}
