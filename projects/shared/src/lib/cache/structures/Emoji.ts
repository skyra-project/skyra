import type { Nullish } from '@sapphire/utilities';
import type { APIEmoji } from 'discord-api-types/v10';
import { arrayEquals } from '../../common/util.js';
import type { Reader } from '../../data/Reader.js';
import { Writer } from '../../data/Writer.js';
import type { IStructure } from './interfaces/IStructure.js';

export class Emoji implements IStructure {
	public readonly id: bigint;
	public readonly name: string;
	public readonly animated: boolean | null;
	public readonly available: boolean | null;
	public readonly managed: boolean | null;
	public readonly requireColons: boolean | null;
	public readonly roles: readonly bigint[];

	public constructor(data: Emoji.Data) {
		this.id = data.id;
		this.name = data.name;
		this.animated = data.animated ?? null;
		this.available = data.available ?? null;
		this.managed = data.managed ?? null;
		this.requireColons = data.requireColons ?? null;
		this.roles = data.roles;
	}

	public equals(other: Emoji) {
		return (
			this.id === other.id &&
			this.name === other.name &&
			this.animated === other.animated &&
			this.available === other.available &&
			this.managed === other.managed &&
			this.requireColons === other.requireColons &&
			arrayEquals(this.roles, other.roles)
		);
	}

	public toBuffer(): Buffer {
		return new Writer(100)
			.u64(this.id)
			.string(this.name)
			.bool(this.animated)
			.bool(this.available)
			.bool(this.managed)
			.bool(this.requireColons)
			.array(this.roles, (buffer, value) => buffer.u64(value)).trimmed;
	}

	public toJSON(): Emoji.Json {
		return {
			id: this.id.toString(),
			name: this.name,
			animated: this.animated ?? undefined,
			available: this.available ?? undefined,
			managed: this.managed ?? undefined,
			require_colons: this.requireColons ?? undefined,
			roles: this.roles.length === 0 ? undefined : this.roles.map((role) => role.toString())
		};
	}

	public static fromAPI(data: Emoji.Json): Emoji {
		return new Emoji({
			id: BigInt(data.id!),
			name: data.name!,
			animated: data.animated,
			available: data.available,
			managed: data.managed,
			requireColons: data.require_colons,
			roles: data.roles?.map((roles) => BigInt(roles)) ?? []
		});
	}

	public static fromBinary(reader: Reader): Emoji {
		return new Emoji({
			id: reader.u64()!,
			name: reader.string()!,
			animated: reader.bool(),
			available: reader.bool(),
			managed: reader.bool(),
			requireColons: reader.bool(),
			roles: reader.array((reader) => reader.u64()!)
		});
	}
}

export namespace Emoji {
	export type Json = APIEmoji;
	export interface Data {
		id: bigint;
		name: string;
		animated?: boolean | Nullish;
		available?: boolean | Nullish;
		managed?: boolean | Nullish;
		requireColons?: boolean | Nullish;
		roles: readonly bigint[];
	}
}
