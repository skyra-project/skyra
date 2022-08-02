import type { GatewayMessageReactionRemoveAllDispatchData } from 'discord-api-types/v10';
import { container, RedisMessageType } from 'skyra-shared';

export async function handleMessageReactionRemoveAll(payload: GatewayMessageReactionRemoveAllDispatchData) {
	await container.broker.send({ type: RedisMessageType.MessageReactionRemoveAll, data: payload });
}
