const { API } = require('../../index');

export default class extends API {

	public run({ guildID }) {
		return ((guild) => guild ? guild.settings.toJSON() : null)(this.client.guilds.get(guildID));
	}

}
