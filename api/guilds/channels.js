const { API, toJSON } = require('../../index');

module.exports = class extends API {

	run({ guildID }) {
		return (guild => guild ? guild.channels.values().map(toJSON.channel) : null)(this.client.guilds.get(guildID));
	}

};
