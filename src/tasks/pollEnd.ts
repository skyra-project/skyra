const { Task } = require('../index');

module.exports = class extends Task {

	public run() {
		return Promise.resolve();
	}

};
