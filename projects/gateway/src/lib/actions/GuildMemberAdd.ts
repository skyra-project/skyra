import type { GatewayGuildMemberAddDispatchData } from 'discord-api-types/v10';
import { container, Member, RedisMessageType } from 'skyra-shared';

export async function handleGuildMemberAdd(payload: GatewayGuildMemberAddDispatchData) {
	await container.cache.members.set(payload.guild_id, Member.fromAPI(payload));
	await container.broker.send({ type: RedisMessageType.MemberAdd, data: payload });
}
