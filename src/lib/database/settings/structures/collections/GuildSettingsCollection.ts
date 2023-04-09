import { GuildEntity } from '#lib/database/entities/GuildEntity';
import { AliasedCollection } from '#lib/database/settings/structures/collections/AliasedCollection';
import { container } from '@sapphire/framework';

export class GuildSettingsCollection extends AliasedCollection<string, GuildEntity> {
	public async fetch(key: string): Promise<GuildEntity> {
		const { guilds } = container.db;
		const existing = await guilds.findOne(key);
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
