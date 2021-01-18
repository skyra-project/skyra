import { Store } from 'klasa';
import { Task } from './Task';

export class TaskStore extends Store<Task> {
	/**
	 * Constructs our TaskStore for use in Klasa
	 * @param client The client that instantiates this store
	 */
	public constructor() {
		super(Task as any, { name: 'tasks' });
		this.context.client.registerStore(this);
	}
}
