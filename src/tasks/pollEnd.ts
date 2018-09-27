const { Task } = require('../index');

export default class extends Task {

	public run() {
		return Promise.resolve();
	}

}
