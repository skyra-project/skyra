import { isNullish } from '@sapphire/utilities';
import type { GatewayGuildMemberUpdateDispatchData } from 'discord-api-types/v10';
import { container, Member, RedisMessageType } from 'skyra-shared';

export async function handleGuildMemberUpdate(payload: GatewayGuildMemberUpdateDispatchData) {
	const old = await container.cache.members.get(payload.guild_id, payload.user.id);
	if (isNullish(old)) {
		await container.cache.members.set(payload.guild_id, Member.fromAPI(payload));
		await container.broker.send({ type: RedisMessageType.MemberUpdate, old: null, data: payload });
	} else {
		const data = old.patch(payload);
		await container.cache.members.set(payload.guild_id, data);
		await container.broker.send({ type: RedisMessageType.MemberUpdate, old: old.toJSON(), data: data.toJSON() });
	}
}
