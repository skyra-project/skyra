const { API, toJSON } = require('../../index');

module.exports = class extends API {

	run({ guildID }) {
		return (guild => guild ? toJSON.guild(guild) : null)(this.client.guilds.get(guildID));
	}

};
