import type { GatewayGuildUpdateDispatchData } from 'discord-api-types/v10';
import { container, Guild, RedisMessageType } from 'skyra-shared';

export async function handleGuildUpdate(payload: GatewayGuildUpdateDispatchData) {
	const old = await container.cache.guilds.get(payload.id);
	const data = Guild.fromAPI(payload);
	await container.cache.guilds.set(data);
	await container.broker.send({ type: RedisMessageType.GuildUpdate, old: old?.toJSON() ?? null, data: data.toJSON() });
}
