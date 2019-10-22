import { GuildMember, Permissions, Role } from 'discord.js';
import { KlasaMessage, Monitor, RateLimitManager } from 'klasa';
import { Events } from '../lib/types/Enums';
import { ClientSettings } from '../lib/types/settings/ClientSettings';
import { GuildSettings, RolesAuto } from '../lib/types/settings/GuildSettings';
import { UserSettings } from '../lib/types/settings/UserSettings';
const MESSAGE_REGEXP = /%ROLE%|%MEMBER%|%MEMBERNAME%|%GUILD%|%POINTS%/g;
const { FLAGS: { MANAGE_ROLES } } = Permissions;

export default class extends Monitor {

	private readonly ratelimits = new RateLimitManager(1, 60000);

	public async run(message: KlasaMessage) {
		try {
			this.ratelimits.acquire(message.author.id).drip();
		} catch {
			return;
		}

		// Ensure the user and member settings are up-to-date
		await message.author.settings.sync();

		try {
			// If boosted guild, increase rewards
			const boosts = this.client.settings!.get(ClientSettings.Boosts.Guilds);
			const add = Math.round(((Math.random() * 4) + 4) * (boosts.includes(message.guild!.id) ? 1.5 : 1));

			const [, points] = await Promise.all([
				message.author.settings.increase(UserSettings.Points, add),
				this.client.queries.upsertIncrementMemberSettings(message.guild!.id, message.author.id, add)
			]);
			await this.handleRoles(message, points);
		} catch (err) {
			this.client.emit(Events.Error, `Failed to add points to ${message.author.id}: ${(err && err.stack) || err}`);
		}
	}

	public async handleRoles(message: KlasaMessage, points: number) {
		const autoRoles = message.guild!.settings.get(GuildSettings.Roles.Auto);
		if (!autoRoles.length || !message.guild!.me!.permissions.has(MANAGE_ROLES)) return;

		const autoRole = this.getLatestRole(autoRoles, points);
		if (!autoRole) return null;

		const role = message.guild!.roles.get(autoRole.id);
		if (!role || role.position > message.guild!.me!.roles.highest.position) {
			message.guild!.settings.update(GuildSettings.Roles.Auto, autoRole, { arrayAction: 'remove', throwOnError: true })
				.then(() => this.handleRoles(message, points))
				.catch(error => this.client.emit(Events.Error, error));
			return;
		}

		if (message.member!.roles.has(role.id)) return null;

		await message.member!.roles.add(role);
		if (message.guild!.settings.get(GuildSettings.Social.Achieve) && message.channel.postable) {
			await message.channel.send(
				this.getMessage(message.member!, role, message.guild!.settings.get(GuildSettings.Social.AchieveMessage)
					|| message.language.tget('MONITOR_SOCIAL_ACHIEVEMENT'), points)
			);
		}
	}

	public getMessage(member: GuildMember, role: Role, content: string, points: number) {
		return content.replace(MESSAGE_REGEXP, match => {
			switch (match) {
				case '%ROLE%': return role.name;
				case '%MEMBER%': return member.toString();
				case '%MEMBERNAME%': return member.user.username;
				case '%GUILD%': return member.guild.name;
				case '%POINTS%': return points.toString();
				default: return match;
			}
		});
	}

	public getLatestRole(autoRoles: readonly RolesAuto[], points: number) {
		let latest: RolesAuto | null = null;
		for (const role of autoRoles) {
			if (role.points > points) break;
			latest = role;
		}
		return latest;
	}

	public shouldRun(message: KlasaMessage) {
		return this.enabled
			&& message.guild !== null
			&& message.author !== null
			&& message.member !== null
			&& !message.author.bot
			&& message.webhookID === null
			&& message.content.length > 0
			&& !message.system
			&& message.author.id !== this.client.user!.id
			&& !message.guild.settings.get(GuildSettings.Social.IgnoreChannels).includes(message.channel.id);
	}

}
