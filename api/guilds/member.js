const { API, toJSON } = require('../../index');

module.exports = class extends API {

	run({ guildID, memberID }) {
		const guild = this.client.guilds.get(guildID);
		if (guild) {
			const member = guild.members.get(memberID);
			if (member) return toJSON.guildMember(member);
		}
		return null;
	}

};
