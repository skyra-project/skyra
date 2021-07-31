import type { Constructor } from '@sapphire/utilities';
import { BitField, Permissions, SystemChannelFlags } from 'discord.js';
import { max } from './common';

function toMap<S extends string, N extends number | bigint>(ctor: Constructor<BitField<S, N>>) {
	return new Map(Object.entries(Reflect.get(ctor, 'FLAGS')).map(([key, value]) => [value as N, key as S] as const));
}

function toInitialOffset<S>(map: Map<number, S>) {
	let i: number;
	let max: number;
	for (i = 0, max = Math.max(...map.keys()); max !== 0; ++i, max >>= 1);
	return i;
}

function toInitialBigIntOffset<S>(map: Map<bigint, S>) {
	let i: bigint;
	let maximum: bigint;
	for (i = 0n, maximum = max(...map.keys()); maximum !== 0n; ++i, maximum >>= 1n);
	return i;
}

function toArray<S, N extends number | bigint>(map: Map<N, S>, maxOffset: N, bits: N): S[] {
	const output: S[] = [];

	const [zeroValue, bitValue] = (typeof bits == 'bigint' ? [0n, 1n] : [0, 1]) as [N, N];
	for (let i = zeroValue; i <= maxOffset; ++i) {
		const offset = (bitValue << i) as N;
		if ((bits & offset) === zeroValue) continue;

		const value = map.get(offset);
		if (value !== undefined) output.push(value);
	}

	return output;
}

export const permissionsFlags = toMap(Permissions);
export const permissionsOffset = toInitialBigIntOffset(permissionsFlags);
export function toPermissionsArray(bits: bigint) {
	return toArray(permissionsFlags, permissionsOffset, bits);
}

export const channelFlags = toMap(SystemChannelFlags);
export const channelOffset = toInitialOffset(channelFlags);
export function toChannelsArray(bits: number) {
	return toArray(channelFlags, channelOffset, bits);
}
