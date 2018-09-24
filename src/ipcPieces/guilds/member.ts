const { API, ToJSON } = require('../../index');

module.exports = class extends API {

	run({ guildID, memberID }) {
		const guild = this.client.guilds.get(guildID);
		if (guild) {
			const member = guild.members.get(memberID);
			if (member) return ToJSON.guildMember(member);
		}
		return null;
	}

};
