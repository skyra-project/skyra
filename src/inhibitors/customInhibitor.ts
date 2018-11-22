import { Inhibitor } from '../index';

export default class extends Inhibitor {

	async run(msg, cmd) {
		if (typeof cmd.inhibit === 'function' && await cmd.inhibit(msg)) throw true;
	}

};
