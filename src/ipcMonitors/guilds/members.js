const { IPCMonitor, ToJSON } = require('../../index');

module.exports = class extends IPCMonitor {

	run({ guildID }) {
		return (guild => guild ? guild.members.map(ToJSON.guildMember) : null)(this.client.guilds.get(guildID));
	}

};
