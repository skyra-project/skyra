import * as GuildSettings from '#lib/database/keys/settings/All';
import { hasAtLeastOneKeyInMap } from '#utils/comparators';
import { Store } from '@sapphire/pieces';
import { ApiRequest, ApiResponse, HttpCodes, LoginData } from '@sapphire/plugin-api';
import { createFunctionInhibitor } from '@skyra/decorators';
import type { RESTAPIPartialCurrentUserGuild } from 'discord-api-types/v8';
import { Client, Guild, GuildMember, Permissions } from 'discord.js';
import { RateLimitManager } from 'klasa';
import { flattenGuild } from './ApiTransformers';
import type { OauthFlattenedGuild, PartialOauthFlattenedGuild, TransformedLoginData } from './types';

function isAdmin(member: GuildMember, roles: readonly string[]): boolean {
	return roles.length === 0 ? member.permissions.has(Permissions.FLAGS.MANAGE_GUILD) : hasAtLeastOneKeyInMap(member.roles.cache, roles);
}

export const authenticated = () =>
	createFunctionInhibitor(
		(request: ApiRequest) => Boolean(request.auth?.token),
		(_request: ApiRequest, response: ApiResponse) => response.error(HttpCodes.Unauthorized)
	);

export function ratelimit(bucket: number, cooldown: number, auth = false) {
	const manager = new RateLimitManager(bucket, cooldown);
	const xRateLimitLimit = bucket;
	return createFunctionInhibitor(
		(request: ApiRequest, response: ApiResponse) => {
			const id = (auth ? request.auth!.id : request.headers['x-forwarded-for'] || request.connection.remoteAddress) as string;
			const bucket = manager.acquire(id);

			response.setHeader('Date', new Date().toUTCString());
			if (bucket.limited) {
				response.setHeader('Retry-After', bucket.remainingTime.toString());
				return false;
			}

			try {
				bucket.drip();
			} catch {}

			response.setHeader('X-RateLimit-Limit', xRateLimitLimit);
			response.setHeader('X-RateLimit-Remaining', bucket.bucket.toString());
			response.setHeader('X-RateLimit-Reset', bucket.remainingTime.toString());

			return true;
		},
		(_request: ApiRequest, response: ApiResponse) => {
			response.error(HttpCodes.TooManyRequests);
		}
	);
}

export async function canManage(guild: Guild, member: GuildMember): Promise<boolean> {
	if (guild.ownerID === member.id) return true;

	const [roles, pnodes] = await guild.readSettings((settings) => [settings[GuildSettings.Roles.Admin], settings.permissionNodes]);

	return isAdmin(member, roles) && (pnodes.run(member, 'conf') ?? true);
}

export async function getManageable(id: string, oauthGuild: RESTAPIPartialCurrentUserGuild, guild: Guild | undefined): Promise<boolean> {
	if (oauthGuild.owner) return true;
	if (typeof guild === 'undefined') return new Permissions(Number(oauthGuild.permissions)).has(Permissions.FLAGS.MANAGE_GUILD);

	const member = await guild.members.fetch(id).catch(() => null);
	if (!member) return false;

	return canManage(guild, member);
}

export async function transformGuild(client: Client, userID: string, data: RESTAPIPartialCurrentUserGuild): Promise<OauthFlattenedGuild> {
	const guild = client.guilds.cache.get(data.id);
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
					icon: data.icon,
					id: data.id,
					joinedTimestamp: null,
					mfaLevel: 0,
					name: data.name,
					ownerID: data.owner ? userID : null,
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

	return {
		...serialized,
		permissions: data.permissions,
		manageable: await getManageable(userID, data, guild),
		skyraIsIn: typeof guild !== 'undefined'
	};
}

export async function transformOauthGuildsAndUser({ user, guilds }: LoginData): Promise<TransformedLoginData> {
	if (!user || !guilds) return { user, guilds };

	const { client } = Store.injectedContext;
	const userID = user.id;

	const transformedGuilds = await Promise.all(guilds.map((guild) => transformGuild(client, userID, guild)));
	return { user, transformedGuilds };
}
