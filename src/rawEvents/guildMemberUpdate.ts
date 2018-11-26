import { RawEvent } from '../lib/structures/RawEvent';
import { WSGuildMemberUpdate } from '../lib/types/Discord';

export default class extends RawEvent {

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
