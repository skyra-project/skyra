const { RawEvent } = require('../index');

module.exports = class extends RawEvent {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, { name: 'GUILD_MEMBER_UPDATE' });
	}

	process(data) {
		const guild = this.client.guilds.get(data.guild_id);
		if (guild) {
			guild.memberSnowflakes.add(data.user.id);
			this.client.usernames.set(data.user.id, `${data.user.username}#${data.user.tag}`);
			const member = guild.members.get(data.user.id);
			// @ts-ignore
			if (member) member._patch(data);
		}
	}

};
