import { WSGuildMemberUpdate } from '../lib/types/DiscordAPI';
import { Event, EventStore } from 'klasa';

export default class extends Event {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: 'GUILD_MEMBER_UPDATE', emitter: store.client.ws });
	}

	public async run(data: WSGuildMemberUpdate): Promise<void> {
		const guild = this.client.guilds.get(data.guild_id);
		if (guild) {
			guild.memberSnowflakes.add(data.user.id);
			this.client.usertags.set(data.user.id, `${data.user.username}#${data.user.discriminator}`);
			const member = guild.members.get(data.user.id);
			// @ts-ignore
			if (member) member._patch(data);
		}
	}

}
