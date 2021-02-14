import { authenticated, ratelimit } from '#lib/api/utils';
import { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, SCOPE } from '#root/config';
import { Mime, Time } from '#utils/constants';
import { fetch, FetchResultTypes } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, HttpCodes, methods, Route, RouteOptions } from '@sapphire/plugin-api';
import type { RESTPostOAuth2AccessTokenResult } from 'discord-api-types/v8';
import { stringify } from 'querystring';

@ApplyOptions<RouteOptions>({ route: 'oauth/user' })
export class UserRoute extends Route {
	@authenticated()
	@ratelimit(2, Time.Minute * 5, true)
	public async [methods.POST](request: ApiRequest, response: ApiResponse) {
		const requestBody = request.body as Record<string, string>;
		if (typeof requestBody.action !== 'string') {
			return response.badRequest();
		}

		if (requestBody.action === 'SYNC_USER') {
			if (!request.auth) return response.error(HttpCodes.Unauthorized);

			const auth = this.context.server.auth!;

			// If the token expires in a day, refresh
			let authToken = request.auth.token;
			if (Date.now() + Time.Day >= request.auth.expires) {
				const body = await this.refreshToken(request.auth.id, request.auth.refresh);
				if (body !== null) {
					const authentication = auth.encrypt({
						id: request.auth.id,
						token: body.access_token,
						refresh: body.refresh_token,
						expires: Date.now() + body.expires_in * 1000
					});

					response.cookies.add(auth.cookie, authentication, { maxAge: body.expires_in });
					authToken = body.access_token;
				}
			}

			try {
				return response.json(await auth.fetchData(authToken));
			} catch (error) {
				this.context.client.logger.fatal(error);
				return response.error(HttpCodes.InternalServerError);
			}
		}

		return response.error(HttpCodes.BadRequest);
	}

	private async refreshToken(id: string, refreshToken: string) {
		const { client } = this.context;
		try {
			client.logger.debug(`Refreshing Token for ${id}`);
			return await fetch<RESTPostOAuth2AccessTokenResult>(
				'https://discord.com/api/v8/oauth2/token',
				{
					method: 'POST',
					body: stringify({
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
				},
				FetchResultTypes.JSON
			);
		} catch (error) {
			client.logger.fatal(error);
			return null;
		}
	}
}
