import type { APISticker } from 'discord-api-types/v10';
import { Writer } from './common/Writer';

export function serializeSticker(data: APISticker) {
	return new Writer(100)
		.u64(data.id)
		.u64(data.pack_id)
		.string(data.name)
		.string(data.description)
		.string(data.tags)
		.u8(data.type)
		.u8(data.format_type)
		.bool(data.available).trimmed;
}
