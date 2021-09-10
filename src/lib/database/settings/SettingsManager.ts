import { GuildSettingsCollection } from './structures/collections/GuildSettingsCollection';
import { SerializerStore } from './structures/SerializerStore';
import { TaskStore } from './structures/TaskStore';

export class SettingsManager {
	public readonly serializers = new SerializerStore();
	public readonly tasks = new TaskStore();
	public readonly guilds = new GuildSettingsCollection();
}
