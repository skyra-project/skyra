const { RawEvent } = require('../index');

export default class extends RawEvent {

	public constructor(client: Skyra, store: RawEventStore, file: string[], directory: string) {
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

}
