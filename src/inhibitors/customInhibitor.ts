const { Inhibitor } = require('../index');

module.exports = class extends Inhibitor {

	async run(msg, cmd) {
		if (typeof cmd.inhibit === 'function' && await cmd.inhibit(msg)) throw true;
	}

};
