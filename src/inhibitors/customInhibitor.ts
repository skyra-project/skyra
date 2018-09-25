const { Inhibitor } = require('../index');

export default class extends Inhibitor {

	public async run(msg, cmd) {
		if (typeof cmd.inhibit === 'function' && await cmd.inhibit(msg)) throw true;
	}

}
