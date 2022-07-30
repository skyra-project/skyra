import type { Nullish } from '@sapphire/utilities';
import type { APIGuildChannel, APIOverwrite, ChannelFlags, ChannelType, OverwriteType } from 'discord-api-types/v10';
import { normalize } from '../../../../common/util';
import type { Reader } from '../../../../data/Reader';
import { Writer } from '../../../../data/Writer';
import type { IStructure } from '../../../interfaces/IStructure';

export abstract class GuildBasedChannel<T extends ChannelType> implements IStructure {
	public readonly id: bigint;
	public readonly type: T;
	public readonly name: string;
	public readonly flags: ChannelFlags | null;
	public readonly nsfw: boolean | null;
	public readonly parentId: bigint | null;
	public readonly permissionOverwrites: readonly GuildBasedChannel.DataPermissionOverwrite[];
	public readonly position: number | null;

	public constructor(data: GuildBasedChannel.Data<T>) {
		this.id = data.id;
		this.type = data.type;
		this.name = data.name;
		this.flags = data.flags ?? null;
		this.nsfw = data.nsfw ?? null;
		this.parentId = data.parentId ?? null;
		this.permissionOverwrites = data.permissionOverwrites ?? [];
		this.position = data.position ?? null;
	}

	public toBuffer(): Buffer {
		return this.toBufferShared().trimmed;
	}

	public toJSON(): GuildBasedChannel.Json<T> {
		return {
			id: this.id.toString(),
			type: this.type,
			name: this.name,
			flags: this.flags ?? undefined,
			nsfw: this.nsfw ?? undefined,
			parent_id: this.parentId?.toString(),
			permission_overwrites: this.permissionOverwrites.map(
				(entry): APIOverwrite => ({
					id: entry.id.toString(),
					type: entry.type,
					allow: entry.allow.toString(),
					deny: entry.deny.toString()
				})
			),
			position: this.position ?? undefined
		};
	}

	protected toBufferShared(): Writer {
		return new Writer(100)
			.u64(this.id)
			.u8(this.type)
			.string(this.name)
			.u8(this.flags)
			.bool(this.nsfw)
			.u64(this.parentId)
			.array(this.permissionOverwrites, (buffer, value) => buffer.u64(value.id).u8(value.type).u64(value.allow).u64(value.deny))
			.u16(this.position);
	}
}

export namespace GuildBasedChannel {
	export type Json<T extends ChannelType> = Omit<APIGuildChannel<T>, 'guild_id'>;

	export interface Data<T extends ChannelType> {
		id: bigint;
		name: string;
		type: T;
		flags?: ChannelFlags | Nullish;
		nsfw?: boolean | Nullish;
		parentId?: bigint | Nullish;
		permissionOverwrites?: readonly DataPermissionOverwrite[] | Nullish;
		position?: number | Nullish;
	}

	export interface DataPermissionOverwrite {
		id: bigint;
		type: OverwriteType;
		allow: bigint;
		deny: bigint;
	}
}

export function guildBasedFromAPIShared<T extends ChannelType>(data: GuildBasedChannel.Json<T>): GuildBasedChannel.Data<T> {
	return {
		id: BigInt(data.id),
		type: data.type,
		name: data.name!,
		flags: data.flags,
		nsfw: data.nsfw,
		parentId: normalize(data.parent_id, BigInt),
		permissionOverwrites: data.permission_overwrites?.map(
			(value): GuildBasedChannel.DataPermissionOverwrite => ({
				id: BigInt(value.id),
				type: value.type,
				allow: BigInt(value.allow),
				deny: BigInt(value.deny)
			})
		),
		position: data.position
	};
}

export function guildBasedFromBinaryShared<T extends ChannelType>(reader: Reader): GuildBasedChannel.Data<T> {
	return {
		id: reader.u64()!,
		type: reader.u8()! as T,
		name: reader.string()!,
		flags: reader.u8(),
		nsfw: reader.bool(),
		parentId: reader.u64(),
		permissionOverwrites: reader.array(
			(reader): GuildBasedChannel.DataPermissionOverwrite => ({
				id: reader.u64()!,
				type: reader.u8()!,
				allow: reader.u64()!,
				deny: reader.u64()!
			})
		),
		position: reader.u16()
	};
}
