import { isNullish } from '@sapphire/utilities';
import type { APIGuildMember, APIUser } from 'discord-api-types/v10';
import { Writer } from './common/Writer';

export function serializeMember(data: APIGuildMember, user?: APIUser) {
	user ??= data.user;
	if (isNullish(user)) throw new TypeError('Expected user to be defined');

	return new Writer(100)
		.u64(user.id)
		.string(user.username)
		.u16(Number(user.discriminator))
		.string(user.avatar)
		.string(data.nick)
		.string(data.avatar)
		.array(data.roles, (buffer, value) => buffer.u64(value))
		.date(data.joined_at)
		.date(data.premium_since)
		.bool(data.deaf)
		.bool(data.mute)
		.bool(data.pending)
		.date(data.communication_disabled_until)
		.bool(user.bot)
		.u32(user.public_flags).trimmed;
}
