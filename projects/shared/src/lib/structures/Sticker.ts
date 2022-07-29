import type { Nullish } from '@sapphire/utilities';
import type { APISticker, StickerFormatType, StickerType } from 'discord-api-types/v10';
import { normalize } from '../common/util';
import type { Reader } from '../data/common/Reader';
import { Writer } from '../data/common/Writer';
import type { IStructure } from './interfaces/IStructure';

export class Sticker implements IStructure {
	public readonly id: bigint;
	public readonly packId: bigint | null;
	public readonly name: string;
	public readonly description: string | null;
	public readonly tags: string;
	public readonly type: StickerType;
	public readonly formatType: StickerFormatType;
	public readonly available: boolean | null;

	public constructor(data: Sticker.Data) {
		this.id = data.id;
		this.packId = data.packId ?? null;
		this.name = data.name;
		this.description = data.description ?? null;
		this.tags = data.tags;
		this.type = data.type;
		this.formatType = data.formatType;
		this.available = data.available ?? null;
	}

	public toBuffer(): Buffer {
		return new Writer(100)
			.u64(this.id)
			.u64(this.packId)
			.string(this.name)
			.string(this.description)
			.string(this.tags)
			.u8(this.type)
			.u8(this.formatType)
			.bool(this.available).trimmed;
	}

	public toJSON(): Sticker.Json {
		return {
			id: this.id.toString(),
			pack_id: this.packId?.toString() ?? undefined,
			name: this.name,
			description: this.description,
			tags: this.tags,
			type: this.type,
			format_type: this.formatType,
			available: this.available ?? undefined
		};
	}

	public static fromAPI(data: Sticker.Json): Sticker {
		return new Sticker({
			id: BigInt(data.id),
			packId: normalize(data.pack_id, BigInt),
			name: data.name,
			description: data.description,
			tags: data.tags,
			type: data.type,
			formatType: data.format_type,
			available: data.available
		});
	}

	public static fromBinary(reader: Reader): Sticker {
		return new Sticker({
			id: reader.u64()!,
			packId: reader.u64(),
			name: reader.string()!,
			description: reader.string(),
			tags: reader.string()!,
			type: reader.u8()!,
			formatType: reader.u8()!,
			available: reader.bool()
		});
	}
}

export namespace Sticker {
	export type Json = APISticker;
	export interface Data {
		id: bigint;
		packId?: bigint | Nullish;
		name: string;
		description?: string | Nullish;
		tags: string;
		type: StickerType;
		formatType: StickerFormatType;
		available?: boolean | Nullish;
	}
}
