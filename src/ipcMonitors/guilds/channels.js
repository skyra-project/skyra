const { IPCMonitor, ToJSON } = require('../../index');

module.exports = class extends IPCMonitor {

	run({ guildID }) {
		return (guild => guild ? guild.channels.map(ToJSON.channel) : null)(this.client.guilds.get(guildID));
	}

};
