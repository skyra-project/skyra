// @ts-nocheck
const { Extendable, Settings, GuildSettings, UserSettings, Gateway } = require('../index');

module.exports = class extends Extendable {

	public constructor(client, store, file, directory) {
		super(client, store, file, directory, { appliesTo: [Gateway] });
	}

	public get Settings() {
		switch (this.type) {
			case 'users': return UserSettings;
			case 'guilds': return GuildSettings;
			default: return Settings;
		}
	}

};
