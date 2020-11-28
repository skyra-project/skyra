import type { Client } from 'discord.js';
import { AliasStore } from 'klasa';
import { Task } from './Task';

export class TaskStore extends AliasStore<string, Task> {
	/**
	 * Constructs our TaskStore for use in Klasa
	 * @param client The client that instantiates this store
	 */
	public constructor(client: Client) {
		super(client as any, 'task', Task as any);
		client.registerStore(this);
	}
}
