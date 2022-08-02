import type { GatewayGuildMembersChunkDispatchData } from 'discord-api-types/v10';
import { container, Member } from 'skyra-shared';

export async function handleGuildMembersChunk(payload: GatewayGuildMembersChunkDispatchData) {
	await container.cache.members.set(
		payload.guild_id,
		payload.members.map((data) => Member.fromAPI(data))
	);
}
