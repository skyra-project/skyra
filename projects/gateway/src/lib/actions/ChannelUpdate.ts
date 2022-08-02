import { isNullish } from '@sapphire/utilities';
import type { GatewayChannelUpdateDispatchData } from 'discord-api-types/v10';
import { Channel, container, RedisMessageType } from 'skyra-shared';

export async function handleChannelUpdate(payload: GatewayChannelUpdateDispatchData) {
	if (!('guild_id' in payload)) return;
	if (isNullish(payload.guild_id)) return;

	const old = (await container.cache.channels.get(payload.guild_id, payload.id))?.toJSON() ?? null;
	await container.cache.channels.set(payload.guild_id, Channel.fromAPI(payload));
	await container.broker.send({ type: RedisMessageType.ChannelUpdate, old, data: payload });
}
