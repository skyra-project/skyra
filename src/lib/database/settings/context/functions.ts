import { SettingsContext } from '#lib/database/settings/context/SettingsContext';
import type { ReadonlyGuildData } from '#lib/database/settings/types';
import { Collection, type Snowflake } from 'discord.js';

const cache = new Collection<Snowflake, SettingsContext>();

export function getSettingsContextByGuildId(guildId: Snowflake): SettingsContext | null {
	return cache.get(guildId) ?? null;
}

export function getSettingsContext(settings: ReadonlyGuildData): SettingsContext {
	return cache.ensure(settings.id, () => new SettingsContext(settings));
}

export function updateSettingsContext(settings: ReadonlyGuildData, data: Partial<ReadonlyGuildData>): void {
	const existing = cache.get(settings.id);
	if (existing) {
		existing.update(settings, data);
	} else {
		const context = new SettingsContext(settings);
		cache.set(settings.id, context);
	}
}

export function deleteSettingsContext(guildId: Snowflake) {
	cache.delete(guildId);
}
