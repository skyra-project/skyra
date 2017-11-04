const { Extendable } = require('../index');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, ['Message']);
	}

	extend(content, timer = 10000) {
		if (!this.channel.postable) return null;
		return this.send(content).then(msg => msg.nuke(timer));
	}

};
