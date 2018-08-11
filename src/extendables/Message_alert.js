// @ts-nocheck
const { Extendable } = require('../index');

module.exports = class extends Extendable {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			appliesTo: ['Message'],
			name: 'alert'
		});
	}

	extend(content, options, timer) {
		if (!this.channel.postable) return Promise.resolve(null);
		if (typeof options === 'number' && typeof timer === 'undefined') {
			timer = options;
			options = undefined;
		}

		return this.sendMessage(content, options).then(msg => {
			msg.nuke(typeof timer === 'number' ? timer : 10000);
			return msg;
		});
	}

};
