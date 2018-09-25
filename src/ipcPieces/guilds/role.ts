const { API, ToJSON } = require('../../index');

export default class extends API {

	public run({ guildID, roleID }) {
		const guild = this.client.guilds.get(guildID);
		if (guild) {
			const role = guild.roles.get(roleID);
			if (role) return ToJSON.role(role);
		}
		return null;
	}

}
