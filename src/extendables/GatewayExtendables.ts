// @ts-nocheck
const { Extendable, Settings, GuildSettings, UserSettings, Gateway } = require('../index');

module.exports = class extends Extendable {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, { appliesTo: [Gateway] });
	}

	get Settings() {
		switch (this.type) {
			case 'users': return UserSettings;
			case 'guilds': return GuildSettings;
			default: return Settings;
		}
	}

};
