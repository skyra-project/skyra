import { container } from '@sapphire/framework';
import type { UserResolvable } from 'discord.js';

/**
 * Retrieves the global rank a user has.
 * @param resolvable The user to retrieve the rank from.
 * @returns The global rank the user has.
 */
export async function fetchGlobalRank(resolvable: UserResolvable): Promise<number> {
	const id = container.client.users.resolveId(resolvable);
	if (id === null) throw new TypeError(`Cannot resolve ${resolvable} to a User.`);

	const list = await container.client.leaderboard.fetch();
	const rank = list.get(id);
	return rank ? rank.position : list.size;
}
