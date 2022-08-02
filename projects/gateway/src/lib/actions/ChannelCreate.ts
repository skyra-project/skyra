import { isNullish } from '@sapphire/utilities';
import type { GatewayChannelCreateDispatchData } from 'discord-api-types/v10';
import { Channel, container, RedisMessageType } from 'skyra-shared';

export async function handleChannelCreate(payload: GatewayChannelCreateDispatchData) {
	if (!('guild_id' in payload)) return;
	if (isNullish(payload.guild_id)) return;

	await container.cache.channels.set(payload.guild_id, Channel.fromAPI(payload));
	await container.broker.send({ type: RedisMessageType.ChannelCreate, data: payload });
}
