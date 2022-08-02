import { isNullish } from '@sapphire/utilities';
import type { GatewayGuildRoleDeleteDispatchData } from 'discord-api-types/v10';
import { container, RedisMessageType } from 'skyra-shared';

export async function handleGuildRoleDelete(payload: GatewayGuildRoleDeleteDispatchData) {
	const old = await container.cache.roles.get(payload.guild_id, payload.role_id);
	if (isNullish(old)) {
		await container.broker.send({ type: RedisMessageType.RoleDelete, old: { id: payload.role_id }, guild_id: payload.guild_id });
	} else {
		await container.cache.roles.remove(payload.guild_id, old.id);
		await container.broker.send({ type: RedisMessageType.RoleDelete, old: old.toJSON(), guild_id: payload.guild_id });
	}
}
