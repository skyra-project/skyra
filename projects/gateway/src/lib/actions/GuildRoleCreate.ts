import type { GatewayGuildRoleCreateDispatchData } from 'discord-api-types/v10';
import { container, RedisMessageType, Role } from 'skyra-shared';

export async function handleGuildRoleCreate(payload: GatewayGuildRoleCreateDispatchData) {
	await container.cache.roles.set(payload.guild_id, Role.fromAPI(payload.role));
	await container.broker.send({ type: RedisMessageType.RoleCreate, data: payload.role, guild_id: payload.guild_id });
}
