const { Extendable, klasaUtil: { sleep } } = require('../index');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, {
			appliesTo: ['Message'],
			name: 'nuke'
		});
	}

	async extend(time = 0) {
		if (time === 0) return nuke(this);

		const count = this.edits.length;
		await sleep(time);

		return !this.deleted && this.edits.length === count ? nuke(this) : this;
	}

};

function nuke(msg) {
	try {
		return msg.delete();
	} catch (error) {
		if (error.code === 10008) return msg;
		Error.captureStackTrace(error);
		throw error;
	}
}
