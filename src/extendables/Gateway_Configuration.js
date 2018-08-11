// @ts-nocheck
const { Extendable, Settings, GuildSettings, UserSettings } = require('../index');

module.exports = class extends Extendable {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			appliesTo: ['Gateway'],
			klasa: true,
			name: 'Settings'
		});
	}

	get extend() {
		switch (this.type) {
			case 'users': return UserSettings;
			case 'guilds': return GuildSettings;
			default: return Settings;
		}
	}

};
