import type { GatewayGuildCreateDispatchData } from 'discord-api-types/v10';
import { Channel, container, Emoji, Guild, Member, Role, Sticker } from 'skyra-shared';

export async function handleGuildCreate(payload: GatewayGuildCreateDispatchData) {
	await container.cache.guilds.set(Guild.fromAPI(payload));
	await container.cache.emojis.set(
		payload.id,
		payload.emojis.map((emoji) => Emoji.fromAPI(emoji))
	);
	await container.cache.channels.set(
		payload.id,
		payload.channels.map((entry) => Channel.fromAPI(entry))
	);
	await container.cache.members.set(
		payload.id,
		payload.members.map((entry) => Member.fromAPI(entry))
	);
	await container.cache.roles.set(
		payload.id,
		payload.roles.map((emoji) => Role.fromAPI(emoji))
	);
	await container.cache.stickers.set(
		payload.id,
		payload.stickers.map((emoji) => Sticker.fromAPI(emoji))
	);
}
