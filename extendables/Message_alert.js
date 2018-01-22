const { Extendable } = require('klasa');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, ['Message'], { name: 'alert' });
	}

	extend(content, options, timer) {
		if (!this.channel.postable) return null;
		if (typeof options === 'number' && typeof timer === 'undefined') {
			timer = options;
			options = undefined;
		}

		return this.sendMessage(content, options).then(msg => msg.nuke(typeof timer === 'number' ? timer : 10000));
	}

};
