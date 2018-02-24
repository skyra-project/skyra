const { API, toJSON } = require('../../index');

module.exports = class extends API {

	run({ guildID, roleID }) {
		const guild = this.client.guilds.get(guildID);
		if (guild) {
			const role = guild.roles.get(roleID);
			if (role) return toJSON.role(role);
		}
		return null;
	}

};
