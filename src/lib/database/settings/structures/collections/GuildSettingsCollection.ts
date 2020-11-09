import { GuildEntity } from '@lib/database/entities/GuildEntity';
import { SettingsCollection, SettingsCollectionCallback } from '@lib/database/settings/base/SettingsCollection';
import { DbSet } from '@lib/database/structures/DbSet';

export interface GuildSettingsCollectionCallback<R> extends SettingsCollectionCallback<GuildEntity, R> {}

export class GuildSettingsCollection extends SettingsCollection<GuildEntity> {
	public async fetch(key: string): Promise<GuildEntity> {
		const { guilds } = await DbSet.connect();
		const existing = await guilds.findOne(key);
		if (existing) return existing;

		const created = new GuildEntity();
		this.set(key, created);
		return created;
	}
}
