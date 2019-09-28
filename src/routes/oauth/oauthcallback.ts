import fetch from 'node-fetch';
import { URL } from 'url';
import { Route, RouteStore, Util, constants } from 'klasa-dashboard-hooks';
import ApiRequest from '../../lib/structures/api/ApiRequest';
import ApiResponse from '../../lib/structures/api/ApiResponse';

export default class extends Route {

	public constructor(store: RouteStore, file: string[], directory: string) {
		super(store, file, directory, { route: '/oauth/callback', authenticated: true });
	}

	public get oauthUser() {
		return this.store.get('oauthUser') as Route;
	}

	public async post(request: ApiRequest, response: ApiResponse) {
		const requestBody = request.body as Record<string, string>;
		if (!requestBody.code) {
			this.noCode(response);
			return;
		}
		const url = new URL('https://discordapp.com/api/oauth2/token');
		url.searchParams.append('grant_type', 'authorization_code');
		url.searchParams.append('redirect_uri', requestBody.redirectUri);
		url.searchParams.append('code', requestBody.code);
		const res = await fetch(url as any, {
			headers: { Authorization: `Basic ${Buffer.from(`${this.client.options.clientID}:${this.client.options.clientSecret}`).toString('base64')}` },
			method: 'POST'
		});
		if (!res.ok) {
			response.error('There was an error fetching the token.');
			return;
		}

		const { oauthUser } = this;

		if (!oauthUser) {
			this.notReady(response);
			return;
		}

		const body = await res.json();
		const user = await (oauthUser as any).api(body.access_token);

		response.end(JSON.stringify({
			access_token: Util.encrypt({
				scope: [user.id, ...user.guilds.map(guild => guild.id)],
				token: body.access_token
			}, this.client.options.clientSecret),
			user
		}));
	}

	public notReady(response: ApiResponse) {
		response.status(500).end(constants.RESPONSES.NOT_READY);
	}

	public noCode(response: ApiResponse) {
		response.status(400).end(constants.RESPONSES.NO_CODE);
	}

}
