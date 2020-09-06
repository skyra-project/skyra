import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { GuildMember, Permissions } from 'discord.js';
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
}
