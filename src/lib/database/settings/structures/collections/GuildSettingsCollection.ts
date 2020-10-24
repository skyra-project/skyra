import { DbSet } from '@lib/structures/DbSet';
import { GuildEntity } from '../../../entities/GuildEntity';
import { SettingsCollection, SettingsCollectionCallback } from '../../base/SettingsCollection';

export interface GuildSettingsCollectionCallback<R> extends SettingsCollectionCallback<GuildEntity, R> {}

export class GuildSettingsCollection extends SettingsCollection<GuildEntity> {
	public async fetch(key: string): Promise<GuildEntity> {
		const connection = await DbSet.connect();
		const existing = await connection.guilds.findOne(key);
		if (existing) return existing;

		const created = new GuildEntity();
		this.set(key, created);
		return created;
	}
}
