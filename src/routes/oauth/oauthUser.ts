import { FlattenedGuild, FlattenedUser, flattenGuild, flattenUser } from '#lib/api/ApiTransformers';
import { canManage } from '#lib/api/utils';
import { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, SCOPE } from '#root/config';
import { Mime, Time } from '#utils/constants';
import { authenticated, fetch, FetchResultTypes, ratelimit } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, methods, Route, RouteOptions } from '@sapphire/plugin-api';
import type { RESTAPIPartialCurrentUserGuild, RESTGetAPICurrentUserGuildsResult, RESTPostOAuth2AccessTokenResult } from 'discord-api-types/v6';
import { Guild, Permissions } from 'discord.js';
import { stringify } from 'querystring';

@ApplyOptions<RouteOptions>({ route: 'oauth/user' })
export default class extends Route {
	@authenticated()
	@ratelimit(2, Time.Minute * 5, true)
	public async [methods.POST](request: ApiRequest, response: ApiResponse) {
		const requestBody = request.body as RequestBody;
		if (typeof requestBody.action !== 'string') {
			return response.badRequest();
		}

		if (requestBody.action === 'SYNC_USER') {
			if (!request.auth) return response.error(401);

			// If the token expires in a day, refresh
			if (Date.now() + Time.Day > request.auth.expires) {
				const body = await this.refreshToken(request.auth.id, request.auth.refresh);
				if (body !== null) {
					const authentication = this.context.server.auth!.encrypt({
						id: request.auth.id,
						token: body.access_token,
						refresh: body.refresh_token,
						expires: body.expires_in
					});

					response.cookies.add('SKYRA_AUTH', authentication, { maxAge: body.expires_in });
				}
			}

			try {
				const user = await this.fetchUser(request.auth.id, requestBody.oauthGuilds);
				if (user === null) return response.error(500);
				return response.json(user);
			} catch (error) {
				this.context.client.logger.fatal(error);
				return response.error(500);
			}
		}

		return response.error(400);
	}

	private async fetchUser(id: string, oauthGuilds: RESTGetAPICurrentUserGuildsResult): Promise<OauthFlattenedUser | null> {
		const { client } = this.context;
		const user = await client.users.fetch(id).catch(() => null);
		if (user === null) return null;

		const guilds: OauthFlattenedGuild[] = [];

		for (const oauthGuild of oauthGuilds) {
			const guild = client.guilds.cache.get(oauthGuild.id);
			const serialized: PartialOauthFlattenedGuild =
				typeof guild === 'undefined'
					? {
							afkChannelID: null,
							afkTimeout: 0,
							applicationID: null,
							approximateMemberCount: null,
							approximatePresenceCount: null,
							available: true,
							banner: null,
							channels: [],
							defaultMessageNotifications: 'MENTIONS',
							description: null,
							embedEnabled: false,
							explicitContentFilter: 'DISABLED',
							features: oauthGuild.features,
							icon: oauthGuild.icon,
							id: oauthGuild.id,
							joinedTimestamp: null,
							mfaLevel: 0,
							name: oauthGuild.name,
							ownerID: oauthGuild.owner ? user.id : null,
							partnered: false,
							preferredLocale: 'en-US',
							premiumSubscriptionCount: null,
							premiumTier: 0,
							region: null,
							roles: [],
							splash: null,
							systemChannelID: null,
							vanityURLCode: null,
							verificationLevel: 'NONE',
							verified: false
					  }
					: flattenGuild(guild);

			guilds.push({
				...serialized,
				permissions: oauthGuild.permissions,
				manageable: await this.getManageable(id, oauthGuild, guild),
				skyraIsIn: typeof guild !== 'undefined'
			});
		}

		return {
			user: flattenUser(user),
			guilds
		};
	}

	private async refreshToken(id: string, refreshToken: string) {
		const { client } = this.context;
		try {
			client.logger.debug(`Refreshing Token for ${id}`);
			return await fetch<RESTPostOAuth2AccessTokenResult>(
				'https://discord.com/api/v6/oauth2/token',
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

	private async getManageable(id: string, oauthGuild: RESTAPIPartialCurrentUserGuild, guild: Guild | undefined) {
		if (oauthGuild.owner) return true;
		if (typeof guild === 'undefined') return new Permissions(oauthGuild.permissions).has(Permissions.FLAGS.MANAGE_GUILD);

		const member = await guild.members.fetch(id).catch(() => null);
		if (!member) return false;

		return canManage(guild, member);
	}
}

interface RequestBody {
	action: 'SYNC_USER';
	oauthGuilds: RESTGetAPICurrentUserGuildsResult;
}

interface PartialOauthFlattenedGuild extends Omit<FlattenedGuild, 'joinedTimestamp' | 'ownerID' | 'region'> {
	joinedTimestamp: FlattenedGuild['joinedTimestamp'] | null;
	ownerID: FlattenedGuild['ownerID'] | null;
	region: FlattenedGuild['region'] | null;
}

interface OauthFlattenedGuild extends PartialOauthFlattenedGuild {
	permissions: number;
	manageable: boolean;
	skyraIsIn: boolean;
}

interface OauthFlattenedUser {
	user: FlattenedUser;
	guilds: OauthFlattenedGuild[];
}
