import { Constructor } from '@sapphire/utilities';
import { BitField, Permissions, SystemChannelFlags } from 'discord.js';

function toMap<T extends string>(ctor: Constructor<BitField<T>>) {
	return new Map(Object.entries(Reflect.get(ctor, 'FLAGS')).map(([key, value]) => [value as number, key as T] as const));
}

function toArray<T>(map: Map<number, T>, bits: number): T[] {
	const output: T[] = [];
	for (let i = 1; i <= bits; i <<= 1) {
		if ((bits & i) === 0) continue;

		const value = map.get(i);
		if (value !== undefined) output.push(value);
	}

	return output;
}

export const permissionsFlags = toMap(Permissions);
export function toPermissionsArray(bits: number) {
	return toArray(permissionsFlags, bits);
}

export const channelFlags = toMap(SystemChannelFlags);
export function toChannelsArray(bits: number) {
	return toArray(channelFlags, bits);
}

if (!channelFlags.has(1 << 2)) {
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
	channelFlags.set(1 << 2, 'REMINDER_MESSAGE_DISABLED' as any);
}
