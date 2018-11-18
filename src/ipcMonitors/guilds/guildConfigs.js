const { IPCMonitor } = require('../../index');

module.exports = class extends IPCMonitor {

	run({ guildID }) {
		return (guild => guild ? guild.settings.toJSON() : null)(this.client.guilds.get(guildID));
	}

};
