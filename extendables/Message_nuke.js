const { Extendable, util: { sleep } } = require('klasa');

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

		const msg = this.channel.messages.get(this.id);
		return msg && msg.edits.length === count ? nuke(this) : this;
	}

};

function nuke(msg) {
	return msg.delete().catch((error) => {
		if (error.code === 10008) return msg;
		throw error;
	});
}
