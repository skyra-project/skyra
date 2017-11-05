const { structures: { Extendable } } = require('../index');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, ['User'], { name: 'profile' });
	}

	get extend() {
		return this.client.handler.social.global.get(this.id);
	}

};
