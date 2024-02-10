import { LoggerManager, ModerationManager, StickyRoleManager } from '#lib/moderation/managers';
import { GuildSecurity } from '#utils/Security/GuildSecurity';
import { container } from '@sapphire/framework';
import type { Guild, GuildResolvable } from 'discord.js';

interface GuildUtilities {
	readonly logger: LoggerManager;
	readonly moderation: ModerationManager;
	readonly security: GuildSecurity;
	readonly stickyRoles: StickyRoleManager;
}

export const cache = new WeakMap<Guild, GuildUtilities>();

export function getGuildUtilities(resolvable: GuildResolvable): GuildUtilities {
	const guild = resolveGuild(resolvable);
	const previous = cache.get(guild);
	if (previous !== undefined) return previous;

	const entry: GuildUtilities = {
		logger: new LoggerManager(guild),
		moderation: new ModerationManager(guild),
		security: new GuildSecurity(guild),
		stickyRoles: new StickyRoleManager(guild)
	};
	cache.set(guild, entry);

	return entry;
}

export const getLogger = getProperty('logger');
export const getModeration = getProperty('moderation');
export const getSecurity = getProperty('security');
export const getStickyRoles = getProperty('stickyRoles');

function getProperty<K extends keyof GuildUtilities>(property: K) {
	return (resolvable: GuildResolvable): GuildUtilities[K] => getGuildUtilities(resolvable)[property];
}

function resolveGuild(resolvable: GuildResolvable): Guild {
	const guild = container.client.guilds.resolve(resolvable);
	if (guild === null) throw new TypeError(`${resolvable} resolved to null.`);

	return guild;
}
