import fetch from 'node-fetch';
import { URL } from 'url';
import { Route, RouteStore, Util } from 'klasa-dashboard-hooks';
import ApiRequest from '../../lib/structures/api/ApiRequest';
import ApiResponse from '../../lib/structures/api/ApiResponse';
import OauthUser from './oauthUser';
import { ratelimit } from '../../lib/util/util';

export default class extends Route {

	public constructor(store: RouteStore, file: string[], directory: string) {
		super(store, file, directory, { route: 'oauth/callback' });
	}

	@ratelimit(2, 60000)
	public async post(request: ApiRequest, response: ApiResponse) {
		const requestBody = request.body as Record<string, string>;
		if (!requestBody.code) {
			response.error(400);
			return;
		}

		const url = new URL('https://discordapp.com/api/oauth2/token');
		url.searchParams.append('grant_type', 'authorization_code');
		url.searchParams.append('redirect_uri', requestBody.redirect_uri);
		url.searchParams.append('code', requestBody.code);

		const res = await fetch(url, {
			headers: { Authorization: `Basic ${Buffer.from(`${this.client.options.clientID}:${this.client.options.clientSecret}`).toString('base64')}` },
			method: 'POST'
		});

		if (!res.ok) {
			console.log(await res.text());
			response.error('There was an error fetching the token.');
			return;
		}

		const oauthUser = this.store.get('oauthUser') as unknown as OauthUser;

		if (!oauthUser) {
			response.error(500);
			return;
		}

		const body = await res.json();
		const user = await oauthUser.api(body.access_token);

		response.json(({
			access_token: Util.encrypt({
				user_id: user.id,
				token: body.access_token
			},
			this.client.options.clientSecret),
			user
		}));

	}

}
