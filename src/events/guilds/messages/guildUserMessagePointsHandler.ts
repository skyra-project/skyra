import { DbSet, GuildEntity, GuildSettings, RolesAuto } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { RateLimitManager } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { Events } from '#lib/types/Enums';
import { hasAtLeastOneKeyInMap } from '#utils/comparators';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import { GuildMember, Permissions, Role } from 'discord.js';

const MESSAGE_REGEXP = /%ROLE%|%MEMBER%|%MEMBERNAME%|%GUILD%|%POINTS%/g;
const {
	FLAGS: { MANAGE_ROLES }
} = Permissions;

@ApplyOptions<EventOptions>({ event: Events.GuildUserMessage })
export class UserEvent extends Event {
	private readonly ratelimits = new RateLimitManager(Time.Minute, 1);

	public async run(message: GuildMessage) {
		const [enabled, multiplier] = await message.guild.readSettings((settings) => [
			this.isEnabled(message, settings),
			settings[GuildSettings.Social.Multiplier]
		]);

		if (!enabled) return;
		if (this.isRatelimited(message.author.id)) return;

		// If boosted guild, increase rewards
		const set = await DbSet.connect();
		const { guildBoost } = await set.clients.ensure();
		const add = (Math.random() * 4 + 4) * (guildBoost.includes(message.guild.id) ? 1.5 : 1);

		const [, points] = await Promise.all([
			this.addUserPoints(set, message.author.id, Math.round(add)),
			this.addMemberPoints(set, message.author.id, message.guild.id, Math.round(add * multiplier))
		]);
		await this.handleRoles(message, points);
	}

	/**
	 * Checks whether or not the settings enable running the handler for the specified message.
	 * @param message The message that ran the event.
	 * @param settings The settings to check the data from.
	 * @returns Whether or not the handler should run.
	 */
	private isEnabled(message: GuildMessage, settings: GuildEntity) {
		// If the social module is not enabled, return false:
		if (!settings[GuildSettings.Social.Enabled]) return false;

		// If the channel is ignored, return false:
		if (settings[GuildSettings.Social.IgnoredChannels].includes(message.channel.id)) return false;

		// If the role is ignored, return false:
		if (hasAtLeastOneKeyInMap(message.member.roles.cache, settings[GuildSettings.Social.IgnoredRoles])) return false;

		// Else, it's enabled, return true
		return true;
	}

	private isRatelimited(userID: string) {
		const rateLimit = this.ratelimits.acquire(userID);
		if (rateLimit.limited) return true;

		rateLimit.consume();
		return false;
	}

	private addUserPoints({ users }: DbSet, userID: string, points: number) {
		return users.lock([userID], async (id) => {
			const user = await users.ensure(id);
			user.points += points;
			await user.save();
			return user.points;
		});
	}

	private async addMemberPoints({ members }: DbSet, userID: string, guildID: string, points: number) {
		const member = await members.ensure(userID, guildID);
		member.points += points;
		await member.save();
		return member.points;
	}

	private async handleRoles(message: GuildMessage, points: number) {
		const autoRoles = await message.guild.readSettings(GuildSettings.Roles.Auto);
		if (!autoRoles.length || !message.guild.me!.permissions.has(MANAGE_ROLES)) return;

		const autoRole = this.getLatestRole(autoRoles, points);
		if (!autoRole) return;

		const role = message.guild.roles.cache.get(autoRole.id);
		if (!role || role.position > message.guild.me!.roles.highest.position) {
			await message.guild
				.writeSettings((settings) => {
					const roleIndex = settings[GuildSettings.Roles.Auto].findIndex((element) => element === autoRole);
					settings[GuildSettings.Roles.Auto].splice(roleIndex, 1);
				})
				.then(() => this.handleRoles(message, points))
				.catch((error) => this.context.client.logger.error(error));
			return;
		}

		if (message.member.roles.cache.has(role.id)) return;

		await message.member.roles.add(role);

		const [shouldAchieve, achievementMessage, t] = await message.guild.readSettings((settings) => [
			settings[GuildSettings.Social.Achieve],
			settings[GuildSettings.Social.AchieveMessage],
			settings.getLanguage()
		]);
		if (shouldAchieve && message.channel.postable) {
			await message.channel.send(
				this.getMessage(message.member!, role, achievementMessage || t(LanguageKeys.Events.Guilds.Messages.SocialAchievement), points)
			);
		}
	}

	private getMessage(member: GuildMember, role: Role, content: string, points: number) {
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

	private getLatestRole(autoRoles: readonly RolesAuto[], points: number) {
		let latest: RolesAuto | null = null;
		for (const role of autoRoles) {
			if (role.points > points) break;
			latest = role;
		}
		return latest;
	}
}
