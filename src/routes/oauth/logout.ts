import { ApiRequest } from '@lib/structures/api/ApiRequest';
import { ApiResponse } from '@lib/structures/api/ApiResponse';
import { OauthData } from '@lib/types/DiscordAPI';
import { Events } from '@lib/types/Enums';
import { Mime } from '@utils/constants';
import { fetch, FetchResultTypes, ratelimit } from '@utils/util';
import { Route, RouteStore } from 'klasa-dashboard-hooks';
import { stringify } from 'querystring';

export default class extends Route {

	private readonly kAuthorization: string;

	public constructor(store: RouteStore, file: string[], directory: string) {
		super(store, file, directory, { route: 'oauth/logout', authenticated: true });
		this.kAuthorization = `Basic ${Buffer.from(`${this.client.options.clientID}:${this.client.options.clientSecret}`).toString('base64')}`;
	}

	@ratelimit(2, 60000)
	public async post(request: ApiRequest, response: ApiResponse) {
		try {
			await fetch('https://discord.com/api/oauth2/token/revoke', {
				method: 'POST',
				body: stringify({
					token: request.auth!.token
				}),
				headers: {
					'Authorization': this.kAuthorization,
					'Content-Type': Mime.Types.ApplicationFormUrlEncoded
				}
			}, FetchResultTypes.JSON) as OauthData;
		} catch (error) {
			this.client.emit(Events.Error, `[KDH] Failed to revoke token: ${error}`);
			return response.error('There was an error revoking the token.');
		}

		response.cookies.add('SKYRA_AUTH', '', { expires: new Date(0) });
		response.json({ success: true });
	}

}
