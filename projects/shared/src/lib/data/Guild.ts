import type { APIGuild, GuildFeature } from 'discord-api-types/v10';
import { Writer } from './common/Writer';

export function serializeGuild(data: APIGuild) {
	return new Writer(100)
		.u64(data.id)
		.u64(data.afk_channel_id)
		.i32(data.afk_timeout)
		.string(data.banner)
		.u8(data.default_message_notifications)
		.string(data.description)
		.string(data.discovery_splash)
		.u8(data.explicit_content_filter)
		.u8(data.hub_type)
		.string(data.icon)
		.u32(features(data.features))
		.u32(data.max_members)
		.u32(data.max_presences)
		.u32(data.max_video_channel_users)
		.u8(data.mfa_level)
		.string(data.name)
		.u8(data.nsfw_level)
		.u64(data.owner_id)
		.string(data.preferred_locale)
		.bool(data.premium_progress_bar_enabled)
		.u16(data.premium_subscription_count)
		.u8(data.premium_tier)
		.u64(data.public_updates_channel_id)
		.u64(data.rules_channel_id)
		.string(data.splash)
		.u8(data.system_channel_flags)
		.u64(data.system_channel_id)
		.string(data.vanity_url_code)
		.u8(data.verification_level)
		.u64(data.widget_channel_id)
		.bool(data.widget_enabled).trimmed;
}

export const GuildFeatureBits = {
	ANIMATED_BANNER: 1 << 0,
	ANIMATED_ICON: 1 << 1,
	BANNER: 1 << 2,
	COMMUNITY: 1 << 3,
	DISCOVERABLE: 1 << 4,
	FEATURABLE: 1 << 5,
	HAS_DIRECTORY_ENTRY: 1 << 6,
	HUB: 1 << 7,
	INVITE_SPLASH: 1 << 8,
	LINKED_TO_HUB: 1 << 9,
	MEMBER_VERIFICATION_GATE_ENABLED: 1 << 10,
	MONETIZATION_ENABLED: 1 << 11,
	MORE_STICKERS: 1 << 12,
	NEWS: 1 << 13,
	PARTNERED: 1 << 14,
	PREVIEW_ENABLED: 1 << 15,
	PRIVATE_THREADS: 1 << 16,
	RELAY_ENABLED: 1 << 17,
	ROLE_ICONS: 1 << 18,
	TICKETED_EVENTS_ENABLED: 1 << 19,
	VANITY_URL: 1 << 20,
	VERIFIED: 1 << 21,
	VIP_REGIONS: 1 << 22,
	WELCOME_SCREEN_ENABLED: 1 << 23
} as const;

function features(features: readonly GuildFeature[]) {
	return features.reduce((bits, feature) => bits | (GuildFeatureBits[feature] ?? 0), 0);
}
