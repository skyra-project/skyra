/* eslint-disable @typescript-eslint/class-literal-property-style */
import { GuildEntity, GuildSettings } from '#lib/database';
import { OWNERS } from '#root/config';
import { hasAtLeastOneKeyInMap } from '#utils/comparators';
import type { GatewayGuildMemberUpdateDispatch } from 'discord-api-types/v6';
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

	public isOwner() {
		return OWNERS.includes(this.id);
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
		const roles = settings[GuildSettings.Roles.Dj];
		return roles.length === 0 ? this.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES) : hasAtLeastOneKeyInMap(this.roles.cache, roles);
	}

	private checkModerator(settings: GuildEntity) {
		const roles = settings[GuildSettings.Roles.Moderator];
		return roles.length === 0 ? this.permissions.has(Permissions.FLAGS.BAN_MEMBERS) : hasAtLeastOneKeyInMap(this.roles.cache, roles);
	}

	private checkAdministrator(settings: GuildEntity) {
		const roles = settings[GuildSettings.Roles.Admin];
		return roles.length === 0 ? this.permissions.has(Permissions.FLAGS.MANAGE_GUILD) : hasAtLeastOneKeyInMap(this.roles.cache, roles);
	}
}

declare module 'discord.js' {
	export interface GuildMember {
		fetchRank(): Promise<number>;
		isDJ(): Promise<boolean>;
		isModerator(): Promise<boolean>;
		isAdmin(): Promise<boolean>;
		isOwner(): boolean;
		canManage(channel: VoiceChannel): Promise<boolean>;

		_patch(data: GatewayGuildMemberUpdateDispatch['d']): void;
	}
}

Structures.extend('GuildMember', () => SkyraGuildMember);
