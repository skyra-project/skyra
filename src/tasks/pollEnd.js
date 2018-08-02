const { Task } = require('../index');

module.exports = class extends Task {

	run() {
		return Promise.resolve();
	}

};
