import { ApiRequest } from '@lib/structures/api/ApiRequest';
import { ApiResponse } from '@lib/structures/api/ApiResponse';
import { Events } from '@lib/types/Enums';
import { CLIENT_ID, CLIENT_SECRET } from '@root/config';
import { ApplyOptions } from '@skyra/decorators';
import { Mime } from '@utils/constants';
import { ratelimit } from '@utils/util';
import { Route, RouteOptions, Util } from 'klasa-dashboard-hooks';
import fetch from 'node-fetch';
import { stringify } from 'querystring';
import { URL } from 'url';
import type OauthUser from './oauthUser';

@ApplyOptions<RouteOptions>({ route: 'oauth/callback' })
export default class extends Route {
	private readonly kAuthorization = `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`;

	@ratelimit(2, 60000)
	public async post(request: ApiRequest, response: ApiResponse) {
		const requestBody = request.body as Record<string, string>;
		if (!requestBody.code) {
			response.error(400);
			return;
		}

		const url = new URL('https://discord.com/api/oauth2/token');
		url.searchParams.append('grant_type', 'authorization_code');
		url.searchParams.append('redirect_uri', requestBody.redirectUri);

		const res = await fetch(url, {
			method: 'POST',
			body: stringify({
				code: requestBody.code
			}),
			headers: {
				Authorization: this.kAuthorization,
				'Content-Type': Mime.Types.ApplicationFormUrlEncoded
			}
		});

		if (!res.ok) {
			this.client.emit(Events.Error, `[KDH] Failed to fetch token: ${await res.text()}`);
			response.error('There was an error fetching the token.');
			return;
		}

		const oauthUser = this.store.get('oauthUser') as OauthUser | undefined;

		if (!oauthUser) {
			response.error(500);
			return;
		}

		const body = (await res.json()) as OauthData;
		const user = await oauthUser.api(body.access_token);
		if (user === null) return response.error(500);

		const authentication = Util.encrypt(
			{
				user_id: user.id,
				token: body.access_token,
				refresh: body.refresh_token,
				expires: body.expires_in
			},
			this.client.options.clientSecret
		);

		response.cookies.add('SKYRA_AUTH', authentication, { maxAge: body.expires_in });
		response.json({ user });
	}
}

// TODO(kyranet): remove cast once @vladfrangu adds OAuth data
interface OauthData {
	access_token: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
	token_type: string;
}
