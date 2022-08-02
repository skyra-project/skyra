import { isNullish } from '@sapphire/utilities';
import type { GatewayMessageCreateDispatchData } from 'discord-api-types/v10';
import { container, Message, RedisMessageType } from 'skyra-shared';

export async function handleMessageCreate(payload: GatewayMessageCreateDispatchData) {
	if (!('guild_id' in payload)) return;
	if (isNullish(payload.guild_id)) return;

	await container.cache.messages.set(payload.channel_id, Message.fromAPI(payload));
	await container.broker.send({ type: RedisMessageType.MessageCreate, data: payload });
}
