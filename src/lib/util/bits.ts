import { BitField, enumToObject } from '@sapphire/bitfield';
import { GuildSystemChannelFlags, PermissionFlagsBits } from 'discord-api-types/v10';

export const PermissionsBits = new BitField(PermissionFlagsBits);
export function toPermissionsArray(bits: bigint) {
	return PermissionsBits.toArray(bits);
}

export const SystemChannelFlag = new BitField(enumToObject(GuildSystemChannelFlags));
export function toChannelsArray(bits: number) {
	return SystemChannelFlag.toArray(bits);
}
