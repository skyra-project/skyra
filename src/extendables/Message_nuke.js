// @ts-nocheck
const { Extendable, klasaUtil: { sleep } } = require('../index');

module.exports = class extends Extendable {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
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

async function nuke(msg) {
	try {
		return await msg.delete();
	} catch (error) {
		if (error.code === 10008) return msg;
		throw error;
	}
}
