import type { GatewayGuildDeleteDispatchData } from 'discord-api-types/v10';
import { container } from 'skyra-shared';

export async function handleGuildDelete(payload: GatewayGuildDeleteDispatchData) {
	for (const channelId of await container.cache.channels.keys(payload.id)) {
		await container.cache.messages.clear(channelId);
	}
	await container.cache.guilds.remove(payload.id);
}
