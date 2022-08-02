import { isNullish } from '@sapphire/utilities';
import type { GatewayGuildMemberRemoveDispatchData } from 'discord-api-types/v10';
import { container, RedisMessageType } from 'skyra-shared';

export async function handleGuildMemberRemove(payload: GatewayGuildMemberRemoveDispatchData) {
	const old = await container.cache.members.get(payload.guild_id, payload.user.id);
	if (isNullish(old)) {
		await container.broker.send({ type: RedisMessageType.MemberRemove, old: null, user: payload.user, guild_id: payload.guild_id });
	} else {
		await container.cache.members.remove(payload.guild_id, old.id);
		await container.broker.send({ type: RedisMessageType.MemberRemove, old: old.toJSON(), user: payload.user, guild_id: payload.guild_id });
	}
}
