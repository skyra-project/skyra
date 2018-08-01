const { API, ToJSON } = require('../../index');

module.exports = class extends API {

	run({ guildID }) {
		return (guild => guild ? guild.channels.map(ToJSON.channel) : null)(this.client.guilds.get(guildID));
	}

};
