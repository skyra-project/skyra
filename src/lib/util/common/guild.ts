import { container } from '@sapphire/framework';
import type { Guild, GuildResolvable } from 'discord.js';

export function resolveGuild(resolvable: GuildResolvable): Guild {
	const guild = container.client.guilds.resolve(resolvable);
	if (guild === null) throw new TypeError(`${resolvable} resolved to null.`);

	return guild;
}
