import { Event, KlasaGuild, EventStore } from 'klasa';
import { GuildMember } from 'discord.js';
import { WSGuildCreate } from '@lib/types/DiscordAPI';
import { Events } from '@lib/types/Enums';

export default class extends Event {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: 'GUILD_CREATE', emitter: store.client.ws });
	}

	public run(data: WSGuildCreate & { shardID: number }, shardID: number) {
		// Early sweep presences
		data.presences = [];

		let guild = this.client.guilds.get(data.id);
		if (guild) {
			if (!guild.available && !data.unavailable) {
				// A newly available guild
				// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
				// @ts-ignore 2339
				guild._patch(data);
			}
		} else {
			// A new guild
			data.shardID = shardID;
			guild = this.client.guilds.add(data);
			if (this.client.ws.status === 0) {
				this.client.emit(Events.GuildCreate, guild);
			}
		}

		this.processSweep(guild);
	}

	private processSweep(guild: KlasaGuild) {
		const membersInVoice: GuildMember[] = [];

		// Cache all tags and prepare for sweep
		for (const member of guild.members.values()) {
			this.client.userTags.create(member.user);
			guild.memberTags.create(member);

			if (member.voice.channelID) membersInVoice.push(member);
		}

		const { me } = guild;

		// Sweep redundant data
		guild.members.clear();
		this.client.users.clear();

		// Populate useful data
		for (const member of membersInVoice) {
			guild.members.set(member.id, member);
			this.client.users.set(member.id, member.user);
		}

		// Populate Skyra's data
		if (me !== null) {
			guild.members.set(me.id, me);
			this.client.users.set(me.id, me.user);
		}
	}

}
