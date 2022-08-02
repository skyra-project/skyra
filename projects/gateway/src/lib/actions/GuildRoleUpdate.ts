import type { GatewayGuildRoleUpdateDispatchData } from 'discord-api-types/v10';
import { container, RedisMessageType, Role } from 'skyra-shared';

export async function handleGuildRoleUpdate(payload: GatewayGuildRoleUpdateDispatchData) {
	const old = await container.cache.roles.get(payload.guild_id, payload.role.id);
	await container.cache.roles.set(payload.guild_id, Role.fromAPI(payload.role));
	await container.broker.send({ type: RedisMessageType.RoleUpdate, old: old?.toJSON() ?? null, data: payload.role, guild_id: payload.guild_id });
}
