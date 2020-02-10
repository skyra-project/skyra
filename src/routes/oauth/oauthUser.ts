import { DashboardUser } from '@lib/queries/common';
import ApiRequest from '@lib/structures/api/ApiRequest';
import ApiResponse from '@lib/structures/api/ApiResponse';
import { Databases } from '@lib/types/constants/Constants';
import { OauthData } from '@lib/types/DiscordAPI';
import { Events } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { REDIRECT_URI, SCOPE } from '@root/config';
import { MemberTag } from '@utils/Cache/MemberTags';
import { Mime, Time } from '@utils/constants';
import { FlattenedGuild, FlattenedUser, flattenGuild, flattenUser } from '@utils/Models/ApiTransform';
import { authenticated, fetch, FetchResultTypes, ratelimit } from '@utils/util';
import { Guild, GuildFeatures, Permissions } from 'discord.js';
import { Route, RouteStore, Util } from 'klasa-dashboard-hooks';
import { stringify } from 'querystring';

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
		const oauthGuilds = await fetch('https://discordapp.com/api/users/@me/guilds', { headers: { Authorization: token } }, FetchResultTypes.JSON) as RawOauthGuild[];

		for (const oauthGuild of oauthGuilds) {
			const guild = this.client.guilds.get(oauthGuild.id);
			const serialized: PartialOauthFlattenedGuild = typeof guild === 'undefined'
				? {
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
					features: oauthGuild.features,
					icon: oauthGuild.icon,
					id: oauthGuild.id,
					joinedTimestamp: null,
					mfaLevel: 0,
					name: oauthGuild.name,
					ownerID: oauthGuild.owner ? user.id : null,
					premiumSubscriptionCount: null,
					premiumTier: 0,
					region: null,
					roles: [],
					splash: null,
					systemChannelID: null,
					vanityURLCode: null,
					verificationLevel: 0
				}
				: flattenGuild(guild);

			guilds.push({
				...serialized,
				permissions: oauthGuild.permissions,
				manageable: this.getManageable(id, oauthGuild, guild),
				skyraIsIn: typeof guild !== 'undefined'
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
			await this.client.providers.default!.update(Databases.DashboardUsers, id, {
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

	private getManageable(id: string, oauthGuild: RawOauthGuild, guild: Guild | undefined) {
		if (oauthGuild.owner) return true;
		if (typeof guild === 'undefined') return new Permissions(oauthGuild.permissions).has(Permissions.FLAGS.MANAGE_GUILD);

		const roleID = guild.settings.get(GuildSettings.Roles.Admin);
		const memberTag = guild.memberTags.get(id);

		// MemberTag must always exist:
		return typeof memberTag !== 'undefined'
			// If Roles.Admin is not configured, check MANAGE_GUILD, else check if the member has the role.
			&& (roleID === null ? new Permissions(oauthGuild.permissions).has(Permissions.FLAGS.MANAGE_GUILD) : memberTag.roles.includes(roleID))
			// Check if despite of having permissions, user permission nodes do not deny them.
			&& this.allowedPermissionsNodeUser(guild, id)
			// Check if despite of having permissions, role permission nodes do not deny them.
			&& this.allowedPermissionsNodeRole(guild, memberTag);
	}

	private allowedPermissionsNodeUser(guild: Guild, userID: string) {
		const permissionNodeRoles = guild.settings.get(GuildSettings.Permissions.Users);
		for (const node of permissionNodeRoles) {
			if (node.id !== userID) continue;
			if (node.allow.includes('settings')) return true;
			if (node.deny.includes('settings')) return false;
		}

		return true;
	}

	private allowedPermissionsNodeRole(guild: Guild, memberTag: MemberTag) {
		// Assume sorted data
		for (const [id, node] of guild.permissionsManager.entries()) {
			if (!memberTag.roles.includes(id)) continue;
			if (node.allow.has('settings')) return true;
			if (node.deny.has('settings')) return false;
		}

		return true;
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

interface OauthFlattenedUser extends FlattenedUser {
	guilds: OauthFlattenedGuild[];
}
