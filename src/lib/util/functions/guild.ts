import { ModerationManager, StickyRoleManager } from '#lib/moderation';
import { StarboardManager } from '#lib/structures';
import { GuildSecurity } from '#utils/Security/GuildSecurity';
import { container } from '@sapphire/framework';
import type { Guild, GuildResolvable } from 'discord.js';

interface GuildUtilities {
	readonly moderation: ModerationManager;
	readonly security: GuildSecurity;
	readonly starboard: StarboardManager;
	readonly stickyRoles: StickyRoleManager;
}

const cache = new WeakMap<Guild, GuildUtilities>();

export function getGuildUtilities(resolvable: GuildResolvable): GuildUtilities {
	const guild = resolveGuild(resolvable);
	const previous = cache.get(guild);
	if (previous !== undefined) return previous;

	const entry: GuildUtilities = {
		moderation: new ModerationManager(guild),
		security: new GuildSecurity(guild),
		starboard: new StarboardManager(guild),
		stickyRoles: new StickyRoleManager(guild)
	};
	cache.set(guild, entry);

	return entry;
}

export function removeGuildUtilities(resolvable: GuildResolvable): boolean {
	return cache.delete(resolveGuild(resolvable));
}

export const getModeration = getProperty('moderation');
export const getSecurity = getProperty('security');
export const getStarboard = getProperty('starboard');
export const getStickyRoles = getProperty('stickyRoles');

export function getAudio(resolvable: GuildResolvable) {
	return container.client.audio!.queues.get(container.client.guilds.resolveId(resolvable)!);
}

function getProperty<K extends keyof GuildUtilities>(property: K) {
	return (resolvable: GuildResolvable): GuildUtilities[K] => getGuildUtilities(resolvable)[property];
}

function resolveGuild(resolvable: GuildResolvable): Guild {
	const guild = container.client.guilds.resolve(resolvable);
	if (guild === null) throw new TypeError(`${resolvable} resolved to null.`);

	return guild;
}
