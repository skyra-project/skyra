import { Task } from '../index';

export default class extends Task {

	run() {
		return Promise.resolve();
	}

};
