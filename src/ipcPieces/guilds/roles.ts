const { API, ToJSON } = require('../../index');

module.exports = class extends API {

	run({ guildID }) {
		return (guild => guild ? guild.roles.map(ToJSON.role) : null)(this.client.guilds.get(guildID));
	}

};
