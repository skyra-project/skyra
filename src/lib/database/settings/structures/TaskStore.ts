import { Store } from '@sapphire/framework';
import { Task } from './Task';

export class TaskStore extends Store<Task> {
	/**
	 * Constructs our TaskStore for use in Skyra
	 * @param client The client that instantiates this store
	 */
	public constructor() {
		super(Task, { name: 'tasks' });
		this.container.client.stores.register(this);
	}
}
