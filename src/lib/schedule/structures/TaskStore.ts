import { Task } from '#lib/schedule/structures/Task';
import { Store } from '@sapphire/framework';

export class TaskStore extends Store<Task, 'tasks'> {
	/**
	 * Constructs our TaskStore for use in Skyra
	 * @param client The client that instantiates this store
	 */
	public constructor() {
		super(Task, { name: 'tasks' });
	}
}
