import { CustomGet } from '@lib/types';
import { Colors } from '@lib/types/constants/Constants';
import { Events } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { MessageLogsEnum } from '@utils/constants';
import { floatPromise, resolveOnErrorCodes } from '@utils/util';
import { RESTJSONErrorCodes } from 'discord-api-types/v6';
import { Guild, GuildMember, MessageEmbed, Permissions, TextChannel, User } from 'discord.js';
import { Event } from 'klasa';

const { FLAGS } = Permissions;
const enum Matches {
	Guild = '%GUILD%',
	Member = '%MEMBER%',
	MemberName = '%MEMBERNAME%',
	MemberTag = '%MEMBERTAG%',
	MemberCount = '%MEMBERCOUNT%',
	Position = '%POSITION%'
}

export default class extends Event {
	private readonly kTransformMessageRegExp = /%MEMBER%|%MEMBERNAME%|%MEMBERTAG%|%GUILD%|%POSITION%|%MEMBERCOUNT%/g;
	private readonly kMessageLogMetaData = {
		Join: { color: Colors.Green, title: LanguageKeys.Events.GuildMemberAdd },
		Mute: { color: Colors.Amber, title: LanguageKeys.Events.GuildMemberAddMute }
	} as const;

	public async run(member: GuildMember) {
		if (await this.handleRAID(member)) return;
		if (await this.handleStickyRoles(member)) return;
		this.handleJoinDM(member);
		this.handleInitialRole(member);
		this.handleGreetingMessage(member);

		// If not muted and memberAdd is configured, handle everything
		if (member.guild.settings.get(GuildSettings.Events.MemberAdd)) {
			this.handleMemberLog(member, this.kMessageLogMetaData.Join);
		}
	}

	private handleMemberLog(member: GuildMember, asset: MessageLogMetaData) {
		this.client.emit(Events.GuildMessageLog, MessageLogsEnum.Member, member.guild, () =>
			new MessageEmbed()
				.setColor(asset.color)
				.setAuthor(`${member.user.tag} (${member.user.id})`, member.user.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
				.setDescription(
					member.guild.language.get(LanguageKeys.Events.GuildMemberAddDescription, {
						mention: member.toString(),
						time: Date.now() - member.user.createdTimestamp
					})
				)
				.setFooter(member.guild.language.get(asset.title))
				.setTimestamp()
		);
	}

	private handleGreetingMessage(member: GuildMember) {
		const channelsGreeting = member.guild.settings.get(GuildSettings.Channels.Greeting);
		const messagesGreeting = member.guild.settings.get(GuildSettings.Messages.Greeting);
		if (channelsGreeting && messagesGreeting) {
			const channel = member.guild.channels.cache.get(channelsGreeting) as TextChannel;
			if (channel && channel.postable) {
				channel
					.send(this.transformMessage(messagesGreeting, member.guild, member.user))
					.catch((error) => this.client.emit(Events.ApiError, error));
			} else {
				member.guild.settings.reset(GuildSettings.Channels.Greeting).catch((error) => this.client.emit(Events.Wtf, error));
			}
		}
	}

	private handleInitialRole(member: GuildMember) {
		const initialRole = member.guild.settings.get(GuildSettings.Roles.Initial);
		if (initialRole) {
			const role = member.guild.roles.cache.get(initialRole);
			if (!role || role.position >= member.guild.me!.roles.highest.position) {
				member.guild.settings.reset(GuildSettings.Roles.Initial).catch((error) => this.client.emit(Events.Wtf, error));
			} else {
				member.roles.add(role).catch((error) => this.client.emit(Events.ApiError, error));
			}
		}
	}

	private handleJoinDM(member: GuildMember) {
		const messagesJoinDM = member.guild.settings.get(GuildSettings.Messages.JoinDM);
		if (messagesJoinDM) {
			floatPromise(
				this,
				resolveOnErrorCodes(
					member.user.send(this.transformMessage(messagesJoinDM, member.guild, member.user)),
					RESTJSONErrorCodes.CannotSendMessagesToThisUser
				)
			);
		}
	}

	private async handleRAID(member: GuildMember) {
		if (!member.guild.settings.get(GuildSettings.Selfmod.Raid) || !member.guild.me!.permissions.has(FLAGS.KICK_MEMBERS)) return false;

		try {
			member.guild.security.raid.acquire(member.id);
			return false;
		} catch {
			for await (const m of member.guild.security.raid) {
				if (m) await m.kick();
			}
		}
		return true;
	}

	private async handleStickyRoles(member: GuildMember) {
		if (!member.guild.me!.permissions.has(FLAGS.MANAGE_ROLES)) return false;

		const stickyRoles = await member.guild.stickyRoles.fetch(member.id);
		if (stickyRoles.length === 0) return false;

		// Handle the case the user is muted
		const rolesMuted = member.guild.settings.get(GuildSettings.Roles.Muted);
		if (rolesMuted && stickyRoles.includes(rolesMuted)) {
			// Handle mute
			const role = member.guild.roles.cache.get(rolesMuted);
			if (role) {
				member.roles.add(role).catch((error) => this.client.emit(Events.ApiError, error));
			} else {
				member.guild.settings.reset(GuildSettings.Roles.Muted).catch((error) => this.client.emit(Events.ApiError, error));
			}

			// Handle log
			this.handleMemberLog(member, this.kMessageLogMetaData.Mute);
			return true;
		}

		member.roles.add([...stickyRoles]).catch((error) => this.client.emit(Events.ApiError, error));

		return false;
	}

	private transformMessage(str: string, guild: Guild, user: User) {
		return str.replace(this.kTransformMessageRegExp, (match) => {
			switch (match) {
				case Matches.Member:
					return `<@${user.id}>`;
				case Matches.MemberName:
					return user.username;
				case Matches.MemberTag:
					return user.tag;
				case Matches.Guild:
					return guild.name;
				case Matches.Position:
					return guild.language.ordinal(guild.memberCount);
				case Matches.MemberCount:
					return guild.memberCount.toString();
				default:
					return match;
			}
		});
	}
}

interface MessageLogMetaData {
	color: number;
	title: CustomGet<string, string>;
}
