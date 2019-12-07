import { Route, RouteStore, Util } from 'klasa-dashboard-hooks';
import { ratelimit, authenticated, fetch, FetchResultTypes } from '../../lib/util/util';
import ApiRequest from '../../lib/structures/api/ApiRequest';
import ApiResponse from '../../lib/structures/api/ApiResponse';
import { Events } from '../../lib/types/Enums';
import { Time, Mime } from '../../lib/util/constants';
import { REDIRECT_URI, SCOPE } from '../../../config';
import { OauthData } from '../../lib/types/DiscordAPI';
import { Databases } from '../../lib/types/constants/Constants';
import { DashboardUser } from '../../lib/queries/common';
import { stringify } from 'querystring';
import { FlattenedGuild, flattenGuild, flattenUser, FlattenedUser } from '../../lib/util/Models/ApiTransform';
import { GuildFeatures } from 'discord.js';

export default class extends Route {

	public constructor(store: RouteStore, file: string[], directory: string) {
		super(store, file, directory, { route: 'oauth/user' });
	}

	public async api(token: string) {
		const oauthUser = await fetch('https://discordapp.com/api/users/@me', {
			headers: { Authorization: `Bearer ${token}` }
		}, FetchResultTypes.JSON) as RawOauthUser;
		return this.fetchUser(oauthUser.id, `Bearer ${token}`);
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
				const user = await this.fetchUser(request.auth!.user_id, `Bearer ${data.accessToken}`);
				if (user === null) return response.error(500);
				return response.json({
					access_token: Util.encrypt({
						user_id: user.id,
						token: data.accessToken
					}, this.client.options.clientSecret),
					user
				});
			} catch (error) {
				this.client.emit(Events.Wtf, error);
				return response.error(500);
			}
		}

		return response.error(400);
	}

	private async fetchUser(id: string, token: string): Promise<OauthFlattenedUser | null> {
		const user = await this.client.users.fetch(id).catch(() => null);
		if (user === null) return null;

		const guilds: OauthFlattenedGuild[] = [];
		for (const guild of this.client.guilds.values()) {
			if (guild.nicknames.has(user.id)) guilds.push(flattenGuild(guild));
		}

		const rawGuilds = await fetch('https://discordapp.com/api/users/@me/guilds', { headers: { Authorization: token } }, FetchResultTypes.JSON) as RawOauthGuild[];
		const included = guilds.map(guild => guild.id);

		for (const guild of rawGuilds) {
			if (included.includes(guild.id)) continue;
			guilds.push({
				afkChannelID: null,
				afkTimeout: 0,
				applicationID: null,
				available: true,
				banner: null,
				channels: [],
				defaultMessageNotifications: 'MENTIONS',
				description: null,
				embedEnabled: false,
				explicitContentFilter: 0,
				features: guild.features,
				icon: guild.icon,
				id: guild.id,
				joinedTimestamp: null,
				mfaLevel: 0,
				name: guild.name,
				ownerID: guild.owner ? user.id : null,
				premiumSubscriptionCount: null,
				premiumTier: 0,
				region: null,
				roles: [],
				splash: null,
				systemChannelID: null,
				vanityURLCode: null,
				verificationLevel: 0
			});
		}

		return {
			...flattenUser(user),
			guilds
		};
	}

	private async refreshToken(id: string, refreshToken: string) {
		try {
			this.client.emit(Events.Debug, `Refreshing Token for ${id}`);
			const data = await fetch('https://discordapp.com/api/v6/oauth2/token', {
				method: 'POST',
				body: stringify({
					client_id: this.client.options.clientID,
					client_secret: this.client.options.clientSecret,
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

interface RawOauthUser {
	id: string;
	username: string;
	avatar: string;
	discriminator: string;
	locale: string;
	mfa_enabled: boolean;
	flags: number;
	premium_type: number;
}

interface RawOauthGuild {
	id: string;
	name: string;
	icon: null | string;
	owner: boolean;
	permissions: number;
	features: GuildFeatures[];
}

interface OauthFlattenedGuild extends Omit<FlattenedGuild, 'joinedTimestamp' | 'ownerID' | 'region'> {
	joinedTimestamp: FlattenedGuild['joinedTimestamp'] | null;
	ownerID: FlattenedGuild['ownerID'] | null;
	region: FlattenedGuild['region'] | null;
}

interface OauthFlattenedUser extends FlattenedUser {
	guilds: OauthFlattenedGuild[];
}
