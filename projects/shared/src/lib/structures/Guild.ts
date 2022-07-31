import type { Nullish } from '@sapphire/utilities';
import type {
	APIGuild,
	GuildDefaultMessageNotifications,
	GuildExplicitContentFilter,
	GuildHubType,
	GuildMFALevel,
	GuildNSFWLevel,
	GuildPremiumTier,
	GuildSystemChannelFlags,
	GuildVerificationLevel
} from 'discord-api-types/v10';
import { normalizeNullable } from '../common/util';
import type { Reader } from '../data/Reader';
import { Writer } from '../data/Writer';
import type { IStructure } from './interfaces/IStructure';
import { fromFeatures, toFeatures } from './values/GuildFeatures';

export class Guild implements IStructure {
	public readonly id: bigint;
	public readonly afkChannelId: bigint | null;
	public readonly afkTimeout: number;
	public readonly banner: string | null;
	public readonly defaultMessageNotifications: GuildDefaultMessageNotifications;
	public readonly description: string | null;
	public readonly discoverySplash: string | null;
	public readonly explicitContentFilter: GuildExplicitContentFilter;
	public readonly hubType: GuildHubType | null;
	public readonly icon: string | null;
	public readonly features: number;
	public readonly maxMembers: number | null;
	public readonly maxPresences: number | null;
	public readonly maxVideoChannelUsers: number | null;
	public readonly mfaLevel: GuildMFALevel;
	public readonly name: string;
	public readonly nsfwLevel: GuildNSFWLevel;
	public readonly ownerId: bigint;
	public readonly preferredLocale: string;
	public readonly premiumProgressBarEnabled: boolean;
	public readonly premiumSubscriptionCount: number | null;
	public readonly premiumTier: GuildPremiumTier;
	public readonly publicUpdatesChannelId: bigint | null;
	public readonly rulesChannelId: bigint | null;
	public readonly splash: string | null;
	public readonly systemChannelFlags: GuildSystemChannelFlags;
	public readonly systemChannelId: bigint | null;
	public readonly vanityUrlCode: string | null;
	public readonly verificationLevel: GuildVerificationLevel;
	public readonly widgetChannelId: bigint | null;
	public readonly widgetEnabled: boolean | null;

	public constructor(data: Guild.Data) {
		this.id = data.id;
		this.afkChannelId = data.afkChannelId ?? null;
		this.afkTimeout = data.afkTimeout;
		this.banner = data.banner ?? null;
		this.defaultMessageNotifications = data.defaultMessageNotifications;
		this.description = data.description ?? null;
		this.discoverySplash = data.discoverySplash ?? null;
		this.explicitContentFilter = data.explicitContentFilter;
		this.hubType = data.hubType ?? null;
		this.icon = data.icon ?? null;
		this.features = data.features;
		this.maxMembers = data.maxMembers ?? null;
		this.maxPresences = data.maxPresences ?? null;
		this.maxVideoChannelUsers = data.maxVideoChannelUsers ?? null;
		this.mfaLevel = data.mfaLevel;
		this.name = data.name;
		this.nsfwLevel = data.nsfwLevel;
		this.ownerId = data.ownerId;
		this.preferredLocale = data.preferredLocale;
		this.premiumProgressBarEnabled = data.premiumProgressBarEnabled;
		this.premiumSubscriptionCount = data.premiumSubscriptionCount ?? null;
		this.premiumTier = data.premiumTier;
		this.publicUpdatesChannelId = data.publicUpdatesChannelId ?? null;
		this.rulesChannelId = data.rulesChannelId ?? null;
		this.splash = data.splash ?? null;
		this.systemChannelFlags = data.systemChannelFlags;
		this.systemChannelId = data.systemChannelId ?? null;
		this.vanityUrlCode = data.vanityUrlCode ?? null;
		this.verificationLevel = data.verificationLevel;
		this.widgetChannelId = data.widgetChannelId ?? null;
		this.widgetEnabled = data.widgetEnabled ?? null;
	}

	public toBuffer(): Buffer {
		return new Writer(200)
			.u64(this.id)
			.u64(this.afkChannelId)
			.i32(this.afkTimeout)
			.string(this.banner)
			.u8(this.defaultMessageNotifications)
			.string(this.description)
			.string(this.discoverySplash)
			.u8(this.explicitContentFilter)
			.u8(this.hubType)
			.string(this.icon)
			.u32(this.features)
			.u32(this.maxMembers)
			.u32(this.maxPresences)
			.u32(this.maxVideoChannelUsers)
			.u8(this.mfaLevel)
			.string(this.name)
			.u8(this.nsfwLevel)
			.u64(this.ownerId)
			.string(this.preferredLocale)
			.bool(this.premiumProgressBarEnabled)
			.u16(this.premiumSubscriptionCount)
			.u8(this.premiumTier)
			.u64(this.publicUpdatesChannelId)
			.u64(this.rulesChannelId)
			.string(this.splash)
			.u8(this.systemChannelFlags)
			.u64(this.systemChannelId)
			.string(this.vanityUrlCode)
			.u8(this.verificationLevel)
			.u64(this.widgetChannelId)
			.bool(this.widgetEnabled).trimmed;
	}

	public toJSON(): Guild.Json {
		return {
			id: this.id.toString(),
			afk_channel_id: this.afkChannelId?.toString() ?? null,
			afk_timeout: this.afkTimeout,
			banner: this.banner,
			default_message_notifications: this.defaultMessageNotifications,
			description: this.description,
			discovery_splash: this.discoverySplash,
			explicit_content_filter: this.explicitContentFilter,
			hub_type: this.hubType,
			icon: this.icon,
			features: fromFeatures(this.features),
			max_members: this.maxMembers ?? undefined,
			max_presences: this.maxPresences ?? undefined,
			max_video_channel_users: this.maxVideoChannelUsers ?? undefined,
			mfa_level: this.mfaLevel,
			name: this.name,
			nsfw_level: this.nsfwLevel,
			owner_id: this.ownerId.toString(),
			preferred_locale: this.preferredLocale,
			premium_progress_bar_enabled: this.premiumProgressBarEnabled,
			premium_subscription_count: this.premiumSubscriptionCount ?? undefined,
			premium_tier: this.premiumTier,
			public_updates_channel_id: this.publicUpdatesChannelId?.toString() ?? null,
			rules_channel_id: this.rulesChannelId?.toString() ?? null,
			splash: this.splash,
			system_channel_flags: this.systemChannelFlags,
			system_channel_id: this.systemChannelId?.toString() ?? null,
			vanity_url_code: this.vanityUrlCode,
			verification_level: this.verificationLevel,
			widget_channel_id: this.widgetChannelId?.toString(),
			widget_enabled: this.widgetEnabled ?? undefined
		};
	}

	public static fromAPI(data: Guild.Json): Guild {
		return new Guild({
			id: BigInt(data.id),
			afkChannelId: normalizeNullable(data.afk_channel_id, BigInt),
			afkTimeout: data.afk_timeout,
			banner: data.banner,
			defaultMessageNotifications: data.default_message_notifications,
			description: data.description,
			discoverySplash: data.discovery_splash,
			explicitContentFilter: data.explicit_content_filter,
			hubType: data.hub_type,
			icon: data.icon,
			features: toFeatures(data.features),
			maxMembers: data.max_members,
			maxPresences: data.max_presences,
			maxVideoChannelUsers: data.max_video_channel_users,
			mfaLevel: data.mfa_level,
			name: data.name,
			nsfwLevel: data.nsfw_level,
			ownerId: BigInt(data.owner_id),
			preferredLocale: data.preferred_locale,
			premiumProgressBarEnabled: data.premium_progress_bar_enabled,
			premiumSubscriptionCount: data.premium_subscription_count,
			premiumTier: data.premium_tier,
			publicUpdatesChannelId: normalizeNullable(data.public_updates_channel_id, BigInt),
			rulesChannelId: normalizeNullable(data.rules_channel_id, BigInt),
			splash: data.splash,
			systemChannelFlags: data.system_channel_flags,
			systemChannelId: normalizeNullable(data.system_channel_id, BigInt),
			vanityUrlCode: data.vanity_url_code,
			verificationLevel: data.verification_level,
			widgetChannelId: normalizeNullable(data.widget_channel_id, BigInt),
			widgetEnabled: data.widget_enabled
		});
	}

	public static fromBinary(reader: Reader): Guild {
		return new Guild({
			id: reader.u64()!,
			afkChannelId: reader.u64(),
			afkTimeout: reader.i32()!,
			banner: reader.string(),
			defaultMessageNotifications: reader.u8()!,
			description: reader.string(),
			discoverySplash: reader.string(),
			explicitContentFilter: reader.u8()!,
			hubType: reader.u8(),
			icon: reader.string(),
			features: reader.u32()!,
			maxMembers: reader.u32(),
			maxPresences: reader.u32(),
			maxVideoChannelUsers: reader.u32(),
			mfaLevel: reader.u8()!,
			name: reader.string()!,
			nsfwLevel: reader.u8()!,
			ownerId: reader.u64()!,
			preferredLocale: reader.string()!,
			premiumProgressBarEnabled: reader.bool()!,
			premiumSubscriptionCount: reader.u16(),
			premiumTier: reader.u8()!,
			publicUpdatesChannelId: reader.u64(),
			rulesChannelId: reader.u64(),
			splash: reader.string(),
			systemChannelFlags: reader.u8()!,
			systemChannelId: reader.u64(),
			vanityUrlCode: reader.string(),
			verificationLevel: reader.u8()!,
			widgetChannelId: reader.u64(),
			widgetEnabled: reader.bool()
		});
	}
}

export namespace Guild {
	export type Json = Omit<APIGuild, 'region' | 'roles' | 'emojis' | 'application_id' | 'stickers'>;

	export interface Data {
		id: bigint;
		afkChannelId?: bigint | Nullish;
		afkTimeout: number;
		banner?: string | Nullish;
		defaultMessageNotifications: GuildDefaultMessageNotifications;
		description?: string | Nullish;
		discoverySplash?: string | Nullish;
		explicitContentFilter: GuildExplicitContentFilter;
		hubType?: GuildHubType | Nullish;
		icon?: string | Nullish;
		features: number;
		maxMembers?: number | Nullish;
		maxPresences?: number | Nullish;
		maxVideoChannelUsers?: number | Nullish;
		mfaLevel: GuildMFALevel;
		name: string;
		nsfwLevel: GuildNSFWLevel;
		ownerId: bigint;
		preferredLocale: string;
		premiumProgressBarEnabled: boolean;
		premiumSubscriptionCount?: number | Nullish;
		premiumTier: GuildPremiumTier;
		publicUpdatesChannelId?: bigint | Nullish;
		rulesChannelId?: bigint | Nullish;
		splash?: string | Nullish;
		systemChannelFlags: GuildSystemChannelFlags;
		systemChannelId?: bigint | Nullish;
		vanityUrlCode?: string | Nullish;
		verificationLevel: GuildVerificationLevel;
		widgetChannelId?: bigint | Nullish;
		widgetEnabled?: boolean | Nullish;
	}
}
