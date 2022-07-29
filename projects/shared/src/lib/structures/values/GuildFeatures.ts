import { isNullishOrZero } from '@sapphire/utilities';
import { GuildFeature } from 'discord-api-types/v10';
import { bitHas } from '../../common/bits';

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

export const GuildFeatureEntries = Object.entries(GuildFeatureBits) as [feature: GuildFeature, bit: number][];

export function toFeatures(features: readonly GuildFeature[]) {
	return features.reduce((bits, feature) => bits | (GuildFeatureBits[feature] ?? 0), 0);
}

export function fromFeatures(value: number): GuildFeature[] {
	if (isNullishOrZero(value)) return [];

	const features: GuildFeature[] = [];
	for (const [feature, bit] of GuildFeatureEntries) {
		if (bitHas(value, bit)) features.push(feature);
	}

	return features;
}
