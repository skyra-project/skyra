import { isNullish } from '@sapphire/utilities';
import type { GatewayMessageDeleteDispatchData } from 'discord-api-types/v10';
import { container, RedisMessageType } from 'skyra-shared';

export async function handleMessageDelete(payload: GatewayMessageDeleteDispatchData) {
	if (!('guild_id' in payload)) return;
	if (isNullish(payload.guild_id)) return;

	const old = await container.cache.messages.get(payload.channel_id, payload.id);
	if (isNullish(old)) {
		await container.broker.send({
			type: RedisMessageType.MessageDelete,
			old: { id: payload.id, channel_id: payload.channel_id, guild_id: payload.guild_id }
		});
	} else {
		await container.cache.messages.remove(payload.channel_id, payload.id);
		await container.broker.send({ type: RedisMessageType.MessageDelete, old: old.toJSON() });
	}
}
