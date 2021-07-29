import type { Constructor } from '@sapphire/utilities';
import { GuildSystemChannelFlags } from 'discord-api-types/v8';
import { BitField, Permissions, SystemChannelFlags } from 'discord.js';

function toMap<T extends string>(ctor: Constructor<BitField<T>>) {
	return new Map(Object.entries(Reflect.get(ctor, 'FLAGS')).map(([key, value]) => [value as number, key as T] as const));
}

function toInitialOffset<T>(map: Map<number, T>) {
	let i: number;
	let max: number;
	for (i = 0, max = Math.max(...map.keys()); max !== 0; ++i, max >>= 1);
	return i;
}

function toArray<T>(map: Map<number, T>, maxOffset: number, bits: number): T[] {
	const output: T[] = [];
	for (let i = 0; i <= maxOffset; ++i) {
		const offset = 1 << i;
		if ((bits & offset) === 0) continue;

		const value = map.get(offset);
		if (value !== undefined) output.push(value);
	}

	return output;
}

export const permissionsFlags = toMap(Permissions);
export const permissionsOffset = toInitialOffset(permissionsFlags);
export function toPermissionsArray(bits: number) {
	return toArray(permissionsFlags, permissionsOffset, bits);
}

export const channelFlags = toMap(SystemChannelFlags);
if (!channelFlags.has(GuildSystemChannelFlags.SUPPRESS_GUILD_REMINDER_NOTIFICATIONS)) {
	// TODO(kyranet): Flags are being renamed with https://github.com/discordjs/discord.js/pull/5506
	// - WELCOME_MESSAGE_DISABLED -> SUPPRESS_JOIN_NOTIFICATIONS
	// - BOOST_MESSAGE_DISABLED -> SUPPRESS_PREMIUM_SUBSCRIPTIONS
	// - [REMINDER_MESSAGE_DISABLED?] -> SUPPRESS_GUILD_REMINDER_NOTIFICATIONS
	// Once we update to discord.js v13, this must be changed, alongside the i18n keys.
	//
	// SystemChannelFlagsString includes 'WELCOME_MESSAGE_DISABLED' and 'BOOST_MESSAGE_DISABLED'
	//
	// - https://github.com/discord/discord-api-docs/pull/2753 implements 'SUPPRESS_GUILD_REMINDER_NOTIFICATIONS'.
	// - discord.js will most likely name this 'REMINDER_MESSAGE_DISABLED'.
	channelFlags.set(GuildSystemChannelFlags.SUPPRESS_GUILD_REMINDER_NOTIFICATIONS, 'REMINDER_MESSAGE_DISABLED' as any);
}

export const channelOffset = toInitialOffset(channelFlags);
export function toChannelsArray(bits: number) {
	return toArray(channelFlags, channelOffset, bits);
}
