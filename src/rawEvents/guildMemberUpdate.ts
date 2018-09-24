const { RawEvent } = require('../index');

module.exports = class extends RawEvent {

	public constructor(client, store, file, directory) {
		super(client, store, file, directory, { name: 'GUILD_MEMBER_UPDATE' });
	}

	public process(data) {
		const guild = this.client.guilds.get(data.guild_id);
		if (guild) {
			guild.nameDictionary.set(data.user.id, data.nick || data.user.username);
			const member = guild.members.get(data.user.id);
			if (member) member._patch(data);
		}
	}

};
