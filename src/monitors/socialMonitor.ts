import { GuildMember, Permissions, Role } from 'discord.js';
import { KlasaMessage, Monitor, RateLimitManager } from 'klasa';
import { GuildSettingsRolesAuto } from '../lib/types/Misc';
const MESSAGE_REGEXP = /%ROLE%|%MEMBER%|%MEMBERNAME%|%GUILD%|%POINTS%/g;
const { FLAGS: { MANAGE_ROLES } } = Permissions;

export default class extends Monitor {

	private ratelimits = new RateLimitManager(1, 60);

	public async run(message: KlasaMessage): Promise<void> {
		if (!message.guild
			|| (message.guild.settings.get('social.ignoreChannels') as string[]).includes(message.channel.id)) return;

		const ratelimit = this.ratelimits.acquire(message.author.id);
		try {
			ratelimit.drip();
		} catch {
			return;
		}

		const member: GuildMember = message.member || await message.guild.members.fetch(message.author.id).catch(() => null);

		// Ensure the user and member settings are up-to-date
		await Promise.all([message.author.settings.sync(), member && member.settings.sync()]);

		try {
			const add = Math.round(((Math.random() * 4) + 4) * (message.guild.settings.get('social.monitorBoost') as number));
			await Promise.all([message.author.settings.increase('points', add), member && member.settings.increase('points', add)]);
			if (member) await this.handleRoles(message, member.settings.get('points') as number);
		} catch (err) {
			this.client.emit('error', `Failed to add points to ${message.author.id}: ${(err && err.stack) || err}`);
		}
	}

	public async handleRoles(message: KlasaMessage, memberPoints: number): Promise<void> {
		const autoRoles = message.guild.settings.get('roles.auto') as GuildSettingsRolesAuto;
		if (!autoRoles.length || !message.guild.me.permissions.has(MANAGE_ROLES)) return;

		const autoRole = this.getLatestRole(autoRoles, memberPoints);
		if (!autoRole) return null;

		const role = message.guild.roles.get(autoRole.id);
		if (!role || role.position > message.guild.me.roles.highest.position) {
			message.guild.settings.update('roles.auto', autoRole, { arrayAction: 'remove' })
				.then(() => this.handleRoles(message, memberPoints))
				.catch((error) => this.client.emit('apiError', error));
			return;
		}

		if (message.member.roles.has(role.id)) return null;

		await message.member.roles.add(role);
		if (message.guild.settings.get('social.achieve') && message.channel.postable) {
			message.channel.send(
				this.getMessage(message.member, role, (message.guild.settings.get('social.achieveMessage') as string) || message.language.get('MONITOR_SOCIAL_ACHIEVEMENT'))
			);
		}
	}

	public getMessage(member: GuildMember, role: Role, content: string): string {
		return content.replace(MESSAGE_REGEXP, (match) => {
			switch (match) {
				case '%ROLE%': return role.name;
				case '%MEMBER%': return member.toString();
				case '%MEMBERNAME%': return member.user.username;
				case '%GUILD%': return member.guild.name;
				case '%POINTS%': return member.settings.get('points').toString();
				default: return match;
			}
		});
	}

	public getLatestRole(autoRoles: GuildSettingsRolesAuto, points: number): { id: string; points: number } {
		let latest = null;
		for (const role of autoRoles) {
			if (role.points > points) break;
			latest = role;
		}
		return latest;
	}

}
