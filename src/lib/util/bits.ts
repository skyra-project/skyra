import { BitField, enumToObject } from '@sapphire/bitfield';
import { objectEntries, omitKeysFromObject } from '@sapphire/utilities';
import { GuildSystemChannelFlags, PermissionFlagsBits } from 'discord.js';

export const PermissionsBits = new BitField(omitKeysFromObject(PermissionFlagsBits, 'ManageEmojisAndStickers'));
export const PermissionsBitsList = objectEntries(PermissionsBits.flags);
export function toPermissionsArray(bits: bigint) {
	return PermissionsBits.toArray(bits);
}

export const SystemChannelFlag = new BitField(enumToObject(GuildSystemChannelFlags));
export const SystemChannelFlagList = objectEntries(SystemChannelFlag.flags);
export function toChannelsArray(bits: number) {
	return SystemChannelFlag.toArray(bits);
}
