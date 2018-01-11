const { Extendable, Configuration } = require('klasa');
const { GuildConfiguration, UserConfiguration } = require('../index');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, ['Gateway'], { klasa: true });
	}

	get extend() {
		switch (this.type) {
			case 'users': return UserConfiguration;
			case 'guilds': return GuildConfiguration;
			default: return Configuration;
		}
	}

};
