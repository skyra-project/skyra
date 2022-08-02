import { isNullish } from '@sapphire/utilities';
import type { GatewayMessageDeleteBulkDispatchData } from 'discord-api-types/v10';
import { container, RedisMessageType } from 'skyra-shared';

export async function handleMessageDeleteBulk(payload: GatewayMessageDeleteBulkDispatchData) {
	if (!('guild_id' in payload)) return;
	if (isNullish(payload.guild_id)) return;

	const entries = await container.cache.messages.get(payload.channel_id, payload.ids);
	await container.cache.messages.remove(payload.channel_id, payload.ids);

	await container.broker.send({
		type: RedisMessageType.MessageDeleteBulk,
		old: payload.ids.map((id) => entries.get(BigInt(id))?.toJSON() ?? { id }),
		channel_id: payload.channel_id,
		guild_id: payload.guild_id
	});
}
