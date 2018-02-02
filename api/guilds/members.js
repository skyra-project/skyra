const { API, toJSON } = require('../../index');

module.exports = class extends API {

	run({ guildID }) {
		return (guild => guild ? guild.members.values().map(toJSON.guildMember) : null)(this.client.guilds.get(guildID));
	}

};
