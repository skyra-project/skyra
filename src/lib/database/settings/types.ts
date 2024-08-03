import type { Guild as GuildData } from '@prisma/client';
import type { DeepReadonly, PickByValue } from '@sapphire/utilities';

export type GuildDataKey = keyof GuildData;
export type GuildDataValue = GuildData[GuildDataKey];

export type ReadonlyGuildData = DeepReadonly<GuildData>;
export type ReadonlyGuildDataValue = DeepReadonly<GuildDataValue>;

export type GuildSettingsOfType<T> = PickByValue<GuildData, T>;

import type { SerializedEmoji } from '#utils/functions';
import type { Snowflake } from 'discord.js';

export type {
	Guild as GuildData,
	GuildSubscription as GuildSubscriptionData,
	Moderation as ModerationData,
	TwitchSubscription as TwitchSubscriptionData,
	User as UserData
} from '@prisma/client';

export interface PermissionsNode {
	allow: readonly Snowflake[];
	deny: readonly Snowflake[];
	id: Snowflake;
}

export type CommandAutoDelete = readonly [Snowflake, number];

export interface DisabledCommandChannel {
	channel: Snowflake;
	commands: readonly Snowflake[];
}

export interface StickyRole {
	roles: readonly Snowflake[];
	user: Snowflake;
}

export interface ReactionRole {
	channel: Snowflake;
	emoji: SerializedEmoji;
	message: Snowflake | null;
	role: Snowflake;
}

export interface UniqueRoleSet {
	name: string;
	roles: readonly Snowflake[];
}
