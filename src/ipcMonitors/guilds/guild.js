const { IPCMonitor, ToJSON } = require('../../index');

module.exports = class extends IPCMonitor {

	run({ guildID }) {
		return (guild => guild ? ToJSON.guild(guild) : null)(this.client.guilds.get(guildID));
	}

};
