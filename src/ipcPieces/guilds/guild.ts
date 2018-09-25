const { API, ToJSON } = require('../../index');

export default class extends API {

	public run({ guildID }) {
		return ((guild) => guild ? ToJSON.guild(guild) : null)(this.client.guilds.get(guildID));
	}

}
