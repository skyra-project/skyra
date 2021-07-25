import { Store } from '@sapphire/framework';
import type { GuildMember, GuildResolvable, User } from 'discord.js';

const container = Store.injectedContext;

/**
 * Retrieves the local rank a member has in a guild.
 * @param member The member to retrieve the rank from.
 * @returns The local rank the member has.
 */
export async function fetchLocalRank(member: GuildMember | User, guild: GuildResolvable): Promise<number> {
	const guildId = container.client.guilds.resolveID(guild)!;
	const list = await container.client.leaderboard.fetch(guildId);
	const rank = list.get(member.id);
	return rank ? rank.position : list.size;
}
