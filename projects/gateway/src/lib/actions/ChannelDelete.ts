import { isNullish } from '@sapphire/utilities';
import type { GatewayChannelDeleteDispatchData } from 'discord-api-types/v10';
import { container, RedisMessageType } from 'skyra-shared';

export async function handleChannelDelete(payload: GatewayChannelDeleteDispatchData) {
	if (!('guild_id' in payload)) return;
	if (isNullish(payload.guild_id)) return;

	await container.cache.channels.remove(payload.guild_id, payload.id);
	await container.broker.send({ type: RedisMessageType.ChannelDelete, old: payload });
}
