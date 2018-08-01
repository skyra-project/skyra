// @ts-nocheck
const { Extendable, Configuration } = require('klasa');
const { GuildConfiguration, UserConfiguration } = require('../index');

module.exports = class extends Extendable {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
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
