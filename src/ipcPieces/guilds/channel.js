const { API, toJSON } = require('../../index');

module.exports = class extends API {

	run({ guildID, channelID }) {
		const guild = this.client.guilds.get(guildID);
		if (guild) {
			const channel = guild.channels.get(channelID);
			if (channel) return toJSON.channel(channel);
		}
		return null;
	}

};
