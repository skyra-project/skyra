import { GuildEntity } from '../../../entities/GuildEntity';
import { DbSet } from '../../../structures/DbSet';
import { SettingsCollection, SettingsCollectionCallback } from '../../base/SettingsCollection';

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
