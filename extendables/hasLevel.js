const { Extendable } = require('../index');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, ['Message']);
	}

	extend(min, settings = this.guildSettings) {
		return this.client.permissionLevels.run(this, min, settings).then(({ permission }) => permission);
	}

};
