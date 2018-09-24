const { API, ToJSON } = require('../../index');

module.exports = class extends API {

	run({ guildID }) {
		return (guild => guild ? guild.members.map(ToJSON.guildMember) : null)(this.client.guilds.get(guildID));
	}

};
