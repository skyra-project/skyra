import { isNullish } from '@sapphire/utilities';
import type { GatewayGuildStickersUpdateDispatchData } from 'discord-api-types/v10';
import { container, RedisMessageType, Sticker } from 'skyra-shared';

export async function handleGuildStickersUpdate(payload: GatewayGuildStickersUpdateDispatchData) {
	const oldEntries = await container.cache.stickers.entries(payload.guild_id);

	for (const sticker of payload.stickers) {
		const updated = Sticker.fromAPI(sticker);
		const old = oldEntries.get(updated.id);

		if (isNullish(old)) {
			// A new sticker has been created:
			await container.cache.stickers.set(payload.guild_id, updated);
			await container.broker.send({ type: RedisMessageType.StickerCreate, data: sticker, guild_id: payload.guild_id });
		} else if (!updated.equals(old)) {
			// A sticker has been updated:
			await container.cache.stickers.set(payload.guild_id, updated);
			await container.broker.send({ type: RedisMessageType.StickerUpdate, old: old.toJSON(), data: sticker, guild_id: payload.guild_id });
		}

		// Remove the processed entry from the retrieved map, as the current
		// entry is a created, updated, or untouched one.
		//
		// The remaining entries will be deleted ones, so this operation comes
		// handy to create a fast sticker deletion dispatch.
		//
		// On a side note, this does not mutate the actual cache, which is in
		// Redis.
		oldEntries.delete(updated.id);
	}

	// Process deleted entries:
	await container.cache.stickers.remove(payload.guild_id, [...oldEntries.keys()]);
	for (const sticker of oldEntries.values()) {
		await container.broker.send({ type: RedisMessageType.StickerDelete, old: sticker.toJSON(), guild_id: payload.guild_id });
	}
}
