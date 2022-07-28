import { GuildEntity, GuildSettings, readSettings, RolesAuto, writeSettings } from '#lib/database';
import type { Difference, GuildMessage } from '#lib/types';
import { Events } from '#lib/types/Enums';
import { formatNumber } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import type { GuildTextBasedChannelTypes } from '@sapphire/discord.js-utilities';
import { Listener, ListenerOptions } from '@sapphire/framework';
import { isNullishOrEmpty } from '@sapphire/utilities';
import { GuildMember, Permissions, Role } from 'discord.js';
import type { TFunction } from 'i18next';

const { FLAGS } = Permissions;

@ApplyOptions<ListenerOptions>({ event: Events.GuildUserMessageSocialPointsAddMemberReward })
export class UserListener extends Listener {
	private readonly regExp =
		/{(role(?:\.(?:id|name|position|colou?r))?|(?:user|member)(?:\.(?:id|(?:user)?name|discriminator|tag))?|(?:guild|server)(?:\.(?:id|name))?|points|level)}/g;

	public async run(message: GuildMessage, difference: Difference<number>) {
		if (!message.guild.me!.permissions.has(FLAGS.MANAGE_ROLES)) return;

		const points = difference.next;
		const information = await readSettings(message.guild, (settings) => this.getInformation(settings, points));
		if (information === null) return;

		const role = await this.ensureRole(message, points, information.role);
		if (role === null) return;
		if (role.position >= message.guild.me!.roles.highest.position) return;
		if (message.member.roles.cache.has(role.id)) return;
		await message.member.roles.add(role);

		if (!information.announce) return;
		const channel = await this.ensureChannel(message, information.channel);
		if (channel === null) return;

		const content = this.getMessage(information.t, message.member, role, information.content, points);
		await channel.send({ content, allowedMentions: { roles: [], users: [message.author.id] } });
	}

	private getInformation(settings: GuildEntity, points: number) {
		const role = this.getNextRole(settings, points);
		if (role === null) return null;

		const content = settings[GuildSettings.Social.AchieveRole];
		if (isNullishOrEmpty(content)) return { announce: false, role } as const;

		return {
			announce: true,
			role,
			content,
			channel: settings[GuildSettings.Social.AchieveChannel] ?? null,
			t: settings.getLanguage()
		} as const;
	}

	private getNextRole(settings: GuildEntity, points: number): RolesAuto | null {
		let latest: RolesAuto | null = null;
		for (const role of settings[GuildSettings.Roles.Auto]) {
			if (role.points > points) break;
			latest = role;
		}

		return latest;
	}

	private async ensureRole(message: GuildMessage, points: number, autoRole: RolesAuto): Promise<Role | null> {
		const roles = message.guild.roles.cache;
		const role = roles.get(autoRole.id);
		if (role !== undefined) return role;

		const fallbackAutoRole = await writeSettings(message.guild, (settings) => {
			settings[GuildSettings.Roles.Auto] = settings[GuildSettings.Roles.Auto].filter((entry) => roles.has(entry.id));
			return this.getNextRole(settings, points);
		});
		if (fallbackAutoRole === null) return null;
		return roles.get(fallbackAutoRole.id) ?? null;
	}

	private async ensureChannel(message: GuildMessage, channelId: string | null): Promise<GuildTextBasedChannelTypes | null> {
		if (channelId === null) return message.channel;

		const channels = message.guild.channels.cache;
		const channel = channels.get(channelId) as GuildTextBasedChannelTypes | undefined;
		if (channel !== undefined) return channel;

		await writeSettings(message.guild, [[GuildSettings.Social.AchieveChannel, null]]);
		return message.channel;
	}

	private getMessage(t: TFunction, member: GuildMember, role: Role, content: string, points: number) {
		return content.replace(this.regExp, (match, value) => {
			switch (value) {
				case 'role':
					return role.toString();
				case 'role.id':
					return role.id;
				case 'role.name':
					return role.name;
				case 'role.position':
					return formatNumber(t, role.position);
				case 'role.color':
				case 'role.colour':
					return role.hexColor;
				case 'user':
				case 'member':
					return member.toString();
				case 'user.id':
				case 'member.id':
					return member.id;
				case 'user.name':
				case 'user.username':
				case 'member.username':
					return member.user.username;
				case 'member.name':
					return member.displayName;
				case 'user.tag':
				case 'member.tag':
					return member.user.tag;
				case 'server':
				case 'server.name':
				case 'guild':
				case 'guild.name':
					return member.guild.name;
				case 'server.id':
				case 'guild.id':
					return member.guild.id;
				case 'points':
					return formatNumber(t, points);
				case 'level':
					return formatNumber(t, this.getLevelFromPoints(points));
				default:
					return match;
			}
		});
	}

	private getLevelFromPoints(points: number): number {
		return Math.floor(0.2 * Math.sqrt(points));
	}
}
