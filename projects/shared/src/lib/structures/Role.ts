import type { Nullish } from '@sapphire/utilities';
import type { APIRole } from 'discord-api-types/v10';
import { normalize } from '../common/util';
import type { Reader } from '../data/Reader';
import { Writer } from '../data/Writer';
import type { IStructure } from './interfaces/IStructure';

export class Role implements IStructure {
	public readonly id: bigint;
	public readonly name: string;
	public readonly color: number;
	public readonly hoist: boolean;
	public readonly icon: string | null;
	public readonly managed: boolean;
	public readonly mentionable: boolean;
	public readonly permissions: bigint;
	public readonly position: number;
	public readonly tags: Role.DataTags | null;
	public readonly unicodeEmoji: string | null;

	public constructor(data: Role.Data) {
		this.id = data.id;
		this.name = data.name;
		this.color = data.color;
		this.hoist = data.hoist;
		this.icon = data.icon ?? null;
		this.managed = data.managed;
		this.mentionable = data.mentionable;
		this.permissions = data.permissions;
		this.position = data.position;
		this.tags = data.tags ?? null;
		this.unicodeEmoji = data.unicodeEmoji ?? null;
	}

	public toBuffer(): Buffer {
		return new Writer(100)
			.u64(this.id)
			.string(this.name)
			.u32(this.color)
			.bool(this.hoist)
			.string(this.icon)
			.bool(this.managed)
			.bool(this.mentionable)
			.u64(this.permissions)
			.u16(this.position)
			.object(this.tags, (buffer, value) =>
				buffer
					.u64(value.botId)
					.bool(value.premiumSubscriber === null)
					.u64(value.integrationId)
			)
			.string(this.unicodeEmoji).trimmed;
	}

	public toJSON(): Role.Json {
		return {
			id: this.id.toString(),
			name: this.name,
			color: this.color,
			hoist: this.hoist,
			icon: this.icon,
			managed: this.managed,
			mentionable: this.mentionable,
			permissions: this.permissions.toString(),
			position: this.position,
			tags:
				normalize(this.tags, (value) => ({
					bot_id: value.botId?.toString() ?? undefined,
					premium_subscriber: value.premiumSubscriber ? null : undefined,
					integration_id: value.integrationId?.toString() ?? undefined
				})) ?? undefined,
			unicode_emoji: this.unicodeEmoji
		};
	}

	public static fromAPI(data: Role.Json): Role {
		return new Role({
			id: BigInt(data.id),
			name: data.name,
			color: data.color,
			hoist: data.hoist,
			icon: data.icon,
			managed: data.managed,
			mentionable: data.mentionable,
			permissions: BigInt(data.permissions),
			position: data.position,
			tags: normalize(data.tags, (value) => ({
				botId: normalize(value.bot_id, BigInt),
				premiumSubscriber: value.premium_subscriber,
				integrationId: normalize(value.integration_id, BigInt)
			})),
			unicodeEmoji: data.unicode_emoji
		});
	}

	public static fromBinary(reader: Reader): Role {
		return new Role({
			id: reader.u64()!,
			name: reader.string()!,
			color: reader.u32()!,
			hoist: reader.bool()!,
			icon: reader.string(),
			managed: reader.bool()!,
			mentionable: reader.bool()!,
			permissions: reader.u64()!,
			position: reader.u16()!,
			tags: reader.object<Role.DataTags>((reader) => ({
				botId: reader.u64(),
				premiumSubscriber: reader.bool(),
				integrationId: reader.u64()
			})),
			unicodeEmoji: reader.string()
		});
	}
}

export namespace Role {
	export type Json = APIRole;
	export interface Data {
		id: bigint;
		name: string;
		color: number;
		hoist: boolean;
		icon?: string | Nullish;
		managed: boolean;
		mentionable: boolean;
		permissions: bigint;
		position: number;
		tags?: DataTags | Nullish;
		unicodeEmoji?: string | Nullish;
	}

	export interface DataTags {
		botId?: bigint | Nullish;
		premiumSubscriber?: boolean | Nullish;
		integrationId?: bigint | Nullish;
	}
}
