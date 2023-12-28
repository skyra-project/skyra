import { GuildEntity } from '#lib/database/entities/GuildEntity';
import { SettingsCollection, type SettingsCollectionCallback } from '#lib/database/settings/base/SettingsCollection';
import { container } from '@sapphire/framework';

export interface GuildSettingsCollectionCallback<R> extends SettingsCollectionCallback<GuildEntity, R> {}

export class GuildSettingsCollection extends SettingsCollection<GuildEntity> {
	public async fetch(key: string): Promise<GuildEntity> {
		const { guilds } = container.db;
		const existing = await guilds.findOne({ where: { id: key } });
		if (existing) {
			this.set(key, existing);
			return existing;
		}

		const created = new GuildEntity();
		created.id = key;
		this.set(key, created);
		return created;
	}
}
