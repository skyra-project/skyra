const { Extendable, util } = require('../index');

const exec = (msg) => {
	msg.action = 'DELETE';
	return msg.delete()
		.catch((error) => {
			if (error.code === 10008) return msg;
			throw error;
		});
};

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, ['Message']);
	}

	async extend(time = 0) {
		if (time === 0) return exec(this);

		const count = this.edits.length;
		return util.sleep(time).then(() => {
			const msg = this.channel.messages.get(this.id);
			if (msg && msg.edits.length === count) return exec(this);
			return null;
		});
	}

};
