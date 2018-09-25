const { API, ToJSON } = require('../../index');

export default class extends API {

	public run({ guildID }) {
		return ((guild) => guild ? guild.members.map(ToJSON.guildMember) : null)(this.client.guilds.get(guildID));
	}

}
