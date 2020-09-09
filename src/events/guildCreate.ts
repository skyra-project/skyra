import { Guild, GuildMember } from 'discord.js';
import { Event } from 'klasa';

export default class extends Event {
	public run(guild: Guild) {
		const membersInVoice: GuildMember[] = [];

		// Cache all tags and prepare for sweep
		for (const member of guild.members.cache.values()) {
			this.client.userTags.create(member.user);
			guild.memberTags.create(member);

			if (member.voice.channelID) membersInVoice.push(member);
		}

		const { me } = guild;

		// Sweep redundant data
		guild.members.cache.clear();
		this.client.users.cache.clear();

		// Populate useful data
		for (const member of membersInVoice) {
			guild.members.cache.set(member.id, member);
			this.client.users.cache.set(member.id, member.user);
		}

		// Populate Skyra's data
		if (me !== null) {
			guild.members.cache.set(me.id, me);
			this.client.users.cache.set(me.id, me.user);
		}
	}
}
