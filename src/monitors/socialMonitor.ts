import { DbSet, GuildSettings, RolesAuto } from '@lib/database';
import { GuildMessage } from '@lib/types';
import { Events } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { CLIENT_ID } from '@root/config';
import { GuildMember, Permissions, Role } from 'discord.js';
import { Monitor, RateLimitManager } from 'klasa';

const MESSAGE_REGEXP = /%ROLE%|%MEMBER%|%MEMBERNAME%|%GUILD%|%POINTS%/g;
const {
	FLAGS: { MANAGE_ROLES }
} = Permissions;

export default class extends Monitor {
	private readonly ratelimits = new RateLimitManager(1, 60000);

	public async run(message: GuildMessage) {
		const [socialEnabled, ignoredChannels, multiplier] = await message.guild.readSettings((settings) => [
			settings[GuildSettings.Social.Enabled],
			settings[GuildSettings.Social.IgnoreChannels],
			settings[GuildSettings.Social.Multiplier]
		]);

		if (!socialEnabled || ignoredChannels.includes(message.channel.id)) return;

		try {
			this.ratelimits.acquire(message.author.id).drip();
		} catch {
			return;
		}

		try {
			// If boosted guild, increase rewards
			const set = await DbSet.connect();
			const { guildBoost } = await set.clients.ensure();
			const add = (Math.random() * 4 + 4) * (guildBoost.includes(message.guild.id) ? 1.5 : 1);

			const [, points] = await Promise.all([
				this.addUserPoints(set, message.author.id, Math.round(add)),
				this.addMemberPoints(set, message.author.id, message.guild.id, Math.round(add * multiplier))
			]);
			await this.handleRoles(message, points);
		} catch (err) {
			this.client.emit(Events.Error, `Failed to add points to ${message.author.id}: ${(err && err.stack) || err}`);
		}
	}

	public async handleRoles(message: GuildMessage, points: number) {
		const autoRoles = await message.guild.readSettings(GuildSettings.Roles.Auto);
		if (!autoRoles.length || !message.guild.me!.permissions.has(MANAGE_ROLES)) return;

		const autoRole = this.getLatestRole(autoRoles, points);
		if (!autoRole) return;

		const role = message.guild.roles.cache.get(autoRole.id);
		if (!role || role.position > message.guild.me!.roles.highest.position) {
			message.guild
				.writeSettings((settings) => {
					const roleIndex = settings[GuildSettings.Roles.Auto].findIndex((element) => element === autoRole);
					settings[GuildSettings.Roles.Auto].splice(roleIndex, 1);
				})
				.then(() => this.handleRoles(message, points))
				.catch((error) => this.client.emit(Events.Error, error));
			return;
		}

		if (message.member!.roles.cache.has(role.id)) return;

		await message.member!.roles.add(role);

		const [shouldAchieve, achievementMessage, language] = await message.guild.readSettings((settings) => [
			settings[GuildSettings.Social.Achieve],
			settings[GuildSettings.Social.AchieveMessage],
			settings.getLanguage()
		]);
		if (shouldAchieve && message.channel.postable) {
			await message.channel.send(
				this.getMessage(message.member!, role, achievementMessage || language.get(LanguageKeys.Monitors.SocialAchievement), points)
			);
		}
	}

	public getMessage(member: GuildMember, role: Role, content: string, points: number) {
		return content.replace(MESSAGE_REGEXP, (match) => {
			switch (match) {
				case '%ROLE%':
					return role.name;
				case '%MEMBER%':
					return member.toString();
				case '%MEMBERNAME%':
					return member.user.username;
				case '%GUILD%':
					return member.guild.name;
				case '%POINTS%':
					return points.toString();
				default:
					return match;
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

	public shouldRun(message: GuildMessage) {
		return (
			this.enabled &&
			message.guild !== null &&
			message.author !== null &&
			message.member !== null &&
			!message.author.bot &&
			message.webhookID === null &&
			message.content.length > 0 &&
			!message.system &&
			message.author.id !== CLIENT_ID
		);
	}

	private addUserPoints(set: DbSet, userID: string, points: number) {
		return set.users.lock([userID], async (id) => {
			const user = await set.users.ensure(id);

			user.points += points;
			await user.save();

			return user.points;
		});
	}

	private async addMemberPoints(set: DbSet, userID: string, guildID: string, points: number) {
		const member = await set.members.ensure(userID, guildID);
		member.points += points;
		await member.save();
		return member.points;
	}
}
