import { GuildSettingsCollection } from '#lib/database/settings/structures/collections/GuildSettingsCollection';
import { SerializerStore } from '#lib/database/settings/structures/SerializerStore';
import { TaskStore } from '#lib/database/settings/structures/TaskStore';

export class SettingsManager {
	public readonly serializers = new SerializerStore();
	public readonly tasks = new TaskStore();
	public readonly guilds = new GuildSettingsCollection();
}
