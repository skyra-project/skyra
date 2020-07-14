import ApiRequest from '@lib/structures/api/ApiRequest';
import ApiResponse from '@lib/structures/api/ApiResponse';
import { DbSet } from '@lib/structures/DbSet';
import { OauthData } from '@lib/types/DiscordAPI';
import { Events } from '@lib/types/Enums';
import { DashboardUserEntity } from '@orm/entities/DashboardUserEntity';
import { Mime, Time } from '@utils/constants';
import { ratelimit } from '@utils/util';
import { Route, RouteStore, Util } from 'klasa-dashboard-hooks';
import fetch from 'node-fetch';
import { stringify } from 'querystring';
import { URL } from 'url';
import type OauthUser from './oauthUser';

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

		const res = await fetch(url, {
			method: 'POST',
			body: stringify({
				code: requestBody.code
			}),
			headers: {
				'Authorization': `Basic ${Buffer.from(`${this.client.options.clientID}:${this.client.options.clientSecret}`).toString('base64')}`,
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

		const body = await res.json() as OauthData;
		const user = await oauthUser.api(body.access_token);
		if (user === null) return response.error(500);

		const { dashboardUsers } = await DbSet.connect();
		const existing = await dashboardUsers.findOne({ where: { id: user.id }, cache: Time.Minute });
		if (existing) {
			existing.expiresAt = new Date(Date.now() + (body.expires_in * Time.Second));
			existing.accessToken = body.access_token;
			existing.refreshToken = body.refresh_token;
			await existing.save();
		} else {
			const created = new DashboardUserEntity();
			created.id = user.id;
			created.expiresAt = new Date(Date.now() + (body.expires_in * Time.Second));
			created.accessToken = body.access_token;
			created.refreshToken = body.refresh_token;
			await dashboardUsers.insert(created);
		}

		response.json(({
			access_token: Util.encrypt({
				user_id: user.id,
				token: body.access_token
			}, this.client.options.clientSecret),
			user
		}));

	}

}
