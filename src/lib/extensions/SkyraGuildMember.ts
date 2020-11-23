/* eslint-disable @typescript-eslint/class-literal-property-style */
import { GuildEntity, GuildSettings } from '@lib/database';
import { GatewayGuildMemberUpdateDispatch } from 'discord-api-types/v6';
import { Permissions, Structures, VoiceChannel } from 'discord.js';

export class SkyraGuildMember extends Structures.get('GuildMember') {
	public async fetchRank() {
		const list = await this.client.leaderboard.fetch(this.guild.id);
		const rank = list.get(this.id);
		if (!rank) return list.size;
		if (!rank.name) rank.name = this.user.username;
		return rank.position;
	}

	public set lastMessageID(_: string | null) {
		// noop
	}

	public get lastMessageID() {
		return null;
	}

	// @ts-expect-error: Setter-Getter combo to make the property never be set.
	public set lastMessageChannelID(_: string | null) {
		// noop
	}

	public get lastMessageChannelID() {
		return null;
	}

	public isDJ() {
		return this.guild.readSettings((settings) => this.checkDj(settings) || this.checkModerator(settings) || this.checkAdministrator(settings));
	}

	public isModerator() {
		return this.guild.readSettings((settings) => this.checkModerator(settings) || this.checkAdministrator(settings));
	}

	public isAdmin() {
		return this.guild.readSettings((settings) => this.checkAdministrator(settings));
	}

	public async canManage(channel: VoiceChannel) {
		const { listeners } = channel;
		const { id } = this;

		// If the member is the only listener, they receive full permissions on them.
		if (listeners.length === 1 && listeners[0] === id) return true;

		// If the member is a DJ, queues are always manageable for them.
		if (await this.isDJ()) return true;

		const [current, tracks] = await Promise.all([this.guild.audio.getCurrentTrack(), this.guild.audio.tracks()]);

		// If the current song and all queued songs are requested by the author, the queue is still manageable.
		if ((current ? current.author === id : true) && tracks.every((track) => track.author === id)) return true;

		// Else if the author is a moderator+, queues are always manageable for them.
		return false;
	}

	private checkDj(settings: GuildEntity) {
		const roleID = settings[GuildSettings.Roles.Dj];
		return roleID ? this.roles.cache.has(roleID) : this.permissions.has(Permissions.FLAGS.BAN_MEMBERS);
	}

	private checkModerator(settings: GuildEntity) {
		const roleID = settings[GuildSettings.Roles.Moderator];
		return roleID ? this.roles.cache.has(roleID) : this.permissions.has(Permissions.FLAGS.BAN_MEMBERS);
	}

	private checkAdministrator(settings: GuildEntity) {
		const roleID = settings[GuildSettings.Roles.Admin];
		return roleID ? this.roles.cache.has(roleID) : this.permissions.has(Permissions.FLAGS.MANAGE_GUILD);
	}
}

declare module 'discord.js' {
	export interface GuildMember {
		fetchRank(): Promise<number>;
		isDJ(): Promise<boolean>;
		isModerator(): Promise<boolean>;
		isAdmin(): Promise<boolean>;
		canManage(channel: VoiceChannel): Promise<boolean>;

		_patch(data: GatewayGuildMemberUpdateDispatch['d']): void;
	}
}

Structures.extend('GuildMember', () => SkyraGuildMember);
