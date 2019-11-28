import { Route, RouteStore } from 'klasa-dashboard-hooks';
import { ratelimit, authenticated, fetch, FetchResultTypes } from '../../lib/util/util';
import ApiRequest from '../../lib/structures/api/ApiRequest';
import ApiResponse from '../../lib/structures/api/ApiResponse';
import { Events } from '../../lib/types/Enums';
import { Time, Mime } from '../../lib/util/constants';
import { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, SCOPE } from '../../../config';
import { OauthData } from '../../lib/types/DiscordAPI';
import { Databases } from '../../lib/types/constants/Constants';
import { DashboardUser } from '../../lib/queries/common';

export default class extends Route {


	public constructor(store: RouteStore, file: string[], directory: string) {
		super(store, file, directory, { route: 'oauth/user' });
	}

	public async api(token: string) {
		token = `Bearer ${token}`;
		const user = await fetch('https://discordapp.com/api/users/@me', { headers: { Authorization: token } }, FetchResultTypes.JSON) as { guilds: unknown };
		user.guilds = await fetch('https://discordapp.com/api/users/@me/guilds', { headers: { Authorization: token } }, FetchResultTypes.JSON);
		return this.client.dashboardUsers.add(user);
	}

	@authenticated
	@ratelimit(2, Time.Minute * 5, true)
	public async post(request: ApiRequest, response: ApiResponse) {
		const requestBody = request.body as Record<string, string>;
		if (typeof requestBody.action !== 'string') {
			return response.error(400);
		}

		if (requestBody.action === 'SYNC_USER') {
			let data = await this.client.queries.fetchDashboardUser(request.auth!.user_id);
			if (data === null) return response.error(401);

			// If the token expires in a day, refresh
			// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
			if (Date.now() + Time.Day > data.expiresAt) {
				const updated = await this.refreshToken(data.id, data.refreshToken);
				if (updated !== null) data = updated;
			}

			try {
				const user = await this.api(data.accessToken);
				// TODO(kyranet): Send token alongside the user
				return response.json({ user });
			} catch (error) {
				this.client.emit(Events.Wtf, error);
				return response.error(500);
			}
		}

		return response.error(400);
	}

	private async refreshToken(id: string, refreshToken: string) {
		try {
			this.client.emit(Events.Debug, `Refreshing Token for ${id}`);
			const data = await fetch('https://discordapp.com/api/v6/oauth2/token', {
				method: 'POST',
				body: JSON.stringify({
					client_id: CLIENT_ID,
					client_secret: CLIENT_SECRET,
					grant_type: 'refresh_token',
					refresh_token: refreshToken,
					redirect_uri: REDIRECT_URI,
					scope: SCOPE
				}),
				headers: {
					'Content-Type': Mime.Types.ApplicationFormUrlEncoded
				}
			}, FetchResultTypes.JSON) as OauthData;

			const expiresAt = Date.now() + data.expires_in;
			await this.client.providers.default.update(Databases.DashboardUsers, id, {
				expires_at: expiresAt,
				access_token: data.access_token,
				refresh_token: data.refresh_token
			});

			const updated: DashboardUser = {
				id,
				expiresAt,
				accessToken: data.access_token,
				refreshToken: data.refresh_token
			};

			return updated;
		} catch (error) {
			this.client.emit(Events.Wtf, error);
			return null;
		}
	}

}
