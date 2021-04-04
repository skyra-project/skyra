import { Constructor } from '@sapphire/utilities';
import { BitField, Permissions, SystemChannelFlags } from 'discord.js';

function toMap<T extends string>(ctor: Constructor<BitField<T>>) {
	return new Map(Object.entries(ctor).map(([key, value]) => [value as number, key as T] as const));
}

function toArray<T>(map: Map<number, T>, bits: number): T[] {
	const output: T[] = [];
	while (bits !== 0) {
		const bit = bits & 1;
		if (bit) output.push(map.get(bit)!);

		bits >>= 1;
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
