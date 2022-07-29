import type { APIEmoji } from 'discord-api-types/v10';
import { Writer } from './common/Writer';

export function serializeEmoji(data: APIEmoji) {
	return new Writer(100)
		.u64(data.id)
		.string(data.name)
		.bool(data.animated)
		.bool(data.available)
		.bool(data.managed)
		.bool(data.require_colons)
		.array(data.roles, (buffer, value) => buffer.u64(value)).trimmed;
}
