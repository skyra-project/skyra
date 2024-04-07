import type { Snowflake } from 'discord.js';

export type LockdownData = LockdownGuildData | LockdownChannelData | LockdownThreadData;

export enum LockdownType {
	Guild,
	Channel,
	Thread
}

interface BaseLockdownData<T extends LockdownType> {
	/**
	 * The type of lockdown that was applied.
	 */
	type: T;

	/**
	 * The ID of the guild where the lockdown was applied.
	 */
	guildId: Snowflake;

	/**
	 * The ID of the user who initiated the lockdown.
	 */
	userId: Snowflake;
}

export interface LockdownGuildData extends BaseLockdownData<LockdownType.Guild> {
	/**
	 * The ID of the role that was locked down.
	 */
	roleId: Snowflake;

	/**
	 * The permissions that were applied to the role, as a bitfield.
	 */
	permissionsApplied: number;

	/**
	 * The original permissions for the role before the lockdown.
	 */
	permissionsOriginal: number;
}

export interface LockdownChannelData extends BaseLockdownData<LockdownType.Channel> {
	/**
	 * The ID of the channel where the lockdown was applied.
	 */
	channelId: Snowflake;

	/**
	 * The ID of the role that was locked down in the channel.
	 */
	roleId: Snowflake;

	/**
	 * The permissions that were applied to the role, as a bitfield.
	 */
	permissionsApplied: number | null;

	/**
	 * The original allow overrides for the role before the lockdown.
	 */
	permissionsOriginalAllow: number;

	/**
	 * The original deny overrides for the role before the lockdown.
	 */
	permissionsOriginalDeny: number;
}

export interface LockdownThreadData extends BaseLockdownData<LockdownType.Thread> {
	/**
	 * The ID of the thread where the lockdown was applied.
	 */
	channelId: Snowflake;
}
