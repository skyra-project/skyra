import { isNullish } from '@sapphire/utilities';
import type { GatewayGuildEmojisUpdateDispatchData } from 'discord-api-types/v10';
import { container, Emoji, RedisMessageType } from 'skyra-shared';

export async function handleGuildEmojisUpdate(payload: GatewayGuildEmojisUpdateDispatchData) {
	const oldEntries = await container.cache.emojis.entries(payload.guild_id);

	for (const emoji of payload.emojis) {
		const updated = Emoji.fromAPI(emoji);
		const old = oldEntries.get(updated.id);

		if (isNullish(old)) {
			// A new emoji has been created:
			await container.cache.emojis.set(payload.guild_id, updated);
			await container.broker.send({ type: RedisMessageType.EmojiCreate, data: emoji, guild_id: payload.guild_id });
		} else if (!updated.equals(old)) {
			// An emoji has been updated:
			await container.cache.emojis.set(payload.guild_id, updated);
			await container.broker.send({ type: RedisMessageType.EmojiUpdate, old: old.toJSON(), data: emoji, guild_id: payload.guild_id });
		}

		// Remove the processed entry from the retrieved map, as the current
		// entry is a created, updated, or untouched one.
		//
		// The remaining entries will be deleted ones, so this operation comes
		// handy to create a fast emoji deletion dispatch.
		//
		// On a side note, this does not mutate the actual cache, which is in
		// Redis.
		oldEntries.delete(updated.id);
	}

	// Process deleted entries:
	await container.cache.emojis.remove(payload.guild_id, [...oldEntries.keys()]);
	for (const emoji of oldEntries.values()) {
		await container.broker.send({ type: RedisMessageType.EmojiDelete, old: emoji.toJSON(), guild_id: payload.guild_id });
	}
}
