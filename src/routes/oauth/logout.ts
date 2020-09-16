import { ApiRequest } from '@lib/structures/api/ApiRequest';
import { ApiResponse } from '@lib/structures/api/ApiResponse';
import { Events } from '@lib/types/Enums';
import { CLIENT_ID, CLIENT_SECRET } from '@root/config';
import { ApplyOptions } from '@skyra/decorators';
import { Mime } from '@utils/constants';
import { fetch, FetchResultTypes, ratelimit } from '@utils/util';
import { Route, RouteOptions } from 'klasa-dashboard-hooks';
import { stringify } from 'querystring';

@ApplyOptions<RouteOptions>({ route: 'oauth/logout', authenticated: true })
export default class extends Route {
	private readonly kAuthorization = `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`;

	@ratelimit(2, 60000)
	public async post(request: ApiRequest, response: ApiResponse) {
		try {
			(await fetch(
				'https://discord.com/api/oauth2/token/revoke',
				{
					method: 'POST',
					body: stringify({
						token: request.auth!.token
					}),
					headers: {
						Authorization: this.kAuthorization,
						'Content-Type': Mime.Types.ApplicationFormUrlEncoded
					}
				},
				FetchResultTypes.JSON
			)) as OauthData;
		} catch (error) {
			this.client.emit(Events.Error, `[KDH] Failed to revoke token: ${error}`);
			return response.error('There was an error revoking the token.');
		}

		response.cookies.add('SKYRA_AUTH', '', { expires: new Date(0) });
		response.json({ success: true });
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
