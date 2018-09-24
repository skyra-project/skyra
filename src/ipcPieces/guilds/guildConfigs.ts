const { API } = require('../../index');

module.exports = class extends API {

	public run({ guildID }) {
		return ((guild) => guild ? guild.settings.toJSON() : null)(this.client.guilds.get(guildID));
	}

};
