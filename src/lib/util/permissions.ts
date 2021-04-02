import { Permissions, PermissionString } from 'discord.js';

export const flags = new Map(Object.entries(Permissions.FLAGS).map(([key, value]) => [value as number, key as PermissionString] as const));

export function difference(previous: number, next: number) {
	const diff = previous ^ next;
	const added = next & diff;
	const removed = previous & diff;
	return { added, removed };
}

export function toArray(bits: number): PermissionString[] {
	const output: PermissionString[] = [];
	while (bits !== 0) {
		const bit = bits & 1;
		if (bit) output.push(flags.get(bit)!);

		bits >>= 1;
	}

	return output;
}
