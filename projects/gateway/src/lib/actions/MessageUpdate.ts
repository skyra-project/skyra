import { isNullish } from '@sapphire/utilities';
import type { GatewayMessageUpdateDispatchData } from 'discord-api-types/v10';
import { container, Message, RedisMessageType } from 'skyra-shared';

export async function handleMessageUpdate(payload: GatewayMessageUpdateDispatchData) {
	if (!('guild_id' in payload)) return;
	if (isNullish(payload.guild_id)) return;

	const old = await container.cache.messages.get(payload.guild_id, payload.id);
	if (isNullish(old)) {
		await container.cache.messages.set(payload.guild_id, Message.fromAPI(payload as any));
		await container.broker.send({ type: RedisMessageType.MessageUpdate, old: null, data: payload });
	} else {
		await container.cache.messages.set(payload.guild_id, old.patch(payload));
		await container.broker.send({ type: RedisMessageType.MessageUpdate, old: old.toJSON(), data: payload });
	}
}
