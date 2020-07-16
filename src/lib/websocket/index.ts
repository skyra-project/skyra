import { Cache } from '@klasa/cache';
import { isObject } from '@klasa/utils';
import { SkyraClient } from '@lib/SkyraClient';
import { ApiRequest, UserAuthObject } from '@lib/structures/api/ApiRequest';
import { CookieStore } from '@lib/structures/api/CookieStore';
import { DEV, WSS_PORT } from '@root/config';
import { enumerable } from '@utils/util';
import { Util } from 'klasa-dashboard-hooks';
import WebSocket, { Server } from 'ws';
import { CloseCodes, WebsocketEvents } from './types';
import WebsocketUser from './WebsocketUser';

export class WebsocketHandler {

	public wss: Server;
	public users = new Cache<string, WebsocketUser>();

	@enumerable(false)
	private client: SkyraClient;

	public constructor(client: SkyraClient) {
		this.client = client;
		this.wss = new Server({ port: WSS_PORT });

		this.wss.on(WebsocketEvents.Connection, (ws: WebSocket, request: ApiRequest) => {
			// We've just gotten a new Websocket Connection
			const ip = (request.headers['x-forwarded-for'] || request.connection.remoteAddress) as string;

			// If they don't have a IP for some reason, close.
			if (!ip) return ws.close(CloseCodes.InternalError);

			// If they already have a connection with this IP, close.
			if (this.users.has(ip)) return ws.close(CloseCodes.PolicyViolation);

			// Read SKYRA_AUTH cookie
			const cookies = new CookieStore(request, null!, !DEV);
			const auth = cookies.get('SKYRA_AUTH');
			if (!auth) return ws.close(CloseCodes.Unauthorized);

			// Decrypt and validate
			const authData = Util.decrypt(auth, this.client.options.clientSecret) as UserAuthObject;
			if (!isObject(authData) || !authData.user_id || !authData.token) return ws.close(CloseCodes.Unauthorized);

			// We have a new "user", add them to this.users
			const websocketUser = new WebsocketUser(this.client, this.wss, ws, ip, authData);
			this.users.set(ip, websocketUser);

			ws.once('close', () => {
				ws.removeAllListeners('message');
				this.users.delete(ip);
			});
		});
	}

}
