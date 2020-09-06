import { WSGuildCreate } from '@lib/types/DiscordAPI';
import { Events } from '@lib/types/Enums';
import { DiscordEvents } from '@lib/types/Events';
import { GuildMember } from 'discord.js';
import { Event, EventStore, KlasaGuild } from 'klasa';

export default class extends Event {
	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: DiscordEvents.GuildCreate, emitter: store.client.ws });
	}

	public async run(data: WSGuildCreate & { shardID: number }, shardID: number) {
		// Early sweep presences
		data.presences = [];

		let guild = this.client.guilds.cache.get(data.id);
		if (guild) {
			if (!guild.available && !data.unavailable) {
				// A newly available guild
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

		await Promise.all(data.voice_states.map((state) => this.client.lavalink.voiceStateUpdate({ ...state, guild_id: data.id })));
	}

	private processSweep(guild: KlasaGuild) {
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
