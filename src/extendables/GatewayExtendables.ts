// @ts-nocheck
const { Extendable, Settings, GuildSettings, UserSettings, Gateway } = require('../index');

export default class extends Extendable {

	public constructor(client: Skyra, store: ExtendableStore, file: string[], directory: string) {
		super(client, store, file, directory, { appliesTo: [Gateway] });
	}

	public get Settings() {
		switch (this.type) {
			case 'users': return UserSettings;
			case 'guilds': return GuildSettings;
			default: return Settings;
		}
	}

}
