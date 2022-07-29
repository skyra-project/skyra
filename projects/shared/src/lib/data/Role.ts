import type { APIRole } from 'discord-api-types/v10';
import { Writer } from './common/Writer';

export function serializeRole(data: APIRole) {
	return new Writer(100)
		.u64(data.id)
		.string(data.name)
		.u32(data.color)
		.bool(data.hoist)
		.string(data.icon)
		.bool(data.managed)
		.bool(data.mentionable)
		.u64(data.permissions)
		.u16(data.position)
		.object(data.tags, (buffer, value) =>
			buffer
				.u64(value.bot_id)
				.bool(value.premium_subscriber === null)
				.u64(value.integration_id)
		)
		.string(data.unicode_emoji).trimmed;
}
