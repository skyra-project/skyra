import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { GuildMember, Permissions, VoiceChannel } from 'discord.js';
import { Extendable, ExtendableStore } from 'klasa';

export default class extends Extendable {
	public constructor(store: ExtendableStore, file: string[], directory: string) {
		super(store, file, directory, { appliesTo: [GuildMember] });
	}

	public async fetchRank(this: GuildMember) {
		const list = await this.client.leaderboard.fetch(this.guild.id);
		const rank = list.get(this.id);
		if (!rank) return list.size;
		if (!rank.name) rank.name = this.user.username;
		return rank.position;
	}

	// @ts-expect-error 2784 https://github.com/microsoft/TypeScript/issues/36883
	public get isDJ(this: GuildMember) {
		const djRole = this.guild.settings.get(GuildSettings.Roles.Dj);

		return this.roles.cache.has(djRole) || this.isStaff;
	}

	public get isStaff() {
		return this.isAdmin || this.isMod;
	}

	// @ts-expect-error 2784 https://github.com/microsoft/TypeScript/issues/36883
	public get isAdmin(this: GuildMember) {
		const adminRole = this.guild.settings.get(GuildSettings.Roles.Admin);

		if (this.roles.cache.has(adminRole)) return true;
		return this.permissions.has(Permissions.FLAGS.MANAGE_GUILD);
	}

	// @ts-expect-error 2784 https://github.com/microsoft/TypeScript/issues/36883
	public get isMod(this: GuildMember) {
		const moderatorRole = this.guild.settings.get(GuildSettings.Roles.Moderator);

		if (this.roles.cache.has(moderatorRole)) return true;
		return this.permissions.has(Permissions.FLAGS.BAN_MEMBERS);
	}

	public async canManage(this: GuildMember, channel: VoiceChannel) {
		const { listeners } = channel;
		const { id } = this;

		// If the member is the only listener, they receive full permissions on them.
		if (listeners.length === 1 && listeners[0] === id) return true;

		// If the member is a DJ, queues are always manageable for them.
		if (this.isDJ) return true;

		const [current, tracks] = await Promise.all([this.guild.audio.current(), this.guild.audio.tracks()]);

		// If the current song and all queued songs are requested by the author, the queue is still manageable.
		if ((current ? current.entry.author === id : true) && tracks.every((track) => track.author === id)) return true;

		// Else if the author is a moderator+, queues are always manageable for them.
		return this.isStaff;
	}
}
