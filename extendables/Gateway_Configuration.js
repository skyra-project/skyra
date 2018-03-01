const { Extendable, Configuration } = require('klasa');
const { GuildConfiguration, UserConfiguration } = require('../index');

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, {
			appliesTo: ['Gateway'],
			klasa: true,
			name: 'Configuration'
		});
	}

	get extend() {
		switch (this.type) {
			case 'users': return UserConfiguration;
			case 'guilds': return GuildConfiguration;
			default: return Configuration;
		}
	}

};
