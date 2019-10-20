import { Task } from 'klasa';

export default class extends Task {

	public run() {
		return Promise.resolve(null);
	}

}
