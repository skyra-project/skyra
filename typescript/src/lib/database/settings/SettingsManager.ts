import type { Client } from 'discord.js';
import { GuildSettingsCollection } from './structures/collections/GuildSettingsCollection';
import { SerializerStore } from './structures/SerializerStore';
import { TaskStore } from './structures/TaskStore';

export class SettingsManager {
	public readonly client: Client;
	public readonly serializers: SerializerStore;
	public readonly tasks: TaskStore;
	public readonly guilds: GuildSettingsCollection;

	public constructor(client: Client) {
		this.client = client;
		this.guilds = new GuildSettingsCollection(client);
		this.serializers = new SerializerStore();
		this.tasks = new TaskStore();
	}
}
