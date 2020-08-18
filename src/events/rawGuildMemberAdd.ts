import { Colors } from '@lib/types/constants/Constants';
import { WSGuildMemberAdd } from '@lib/types/DiscordAPI';
import { Events } from '@lib/types/Enums';
import { DiscordEvents } from '@lib/types/Events';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { APIErrors, MessageLogsEnum } from '@utils/constants';
import { floatPromise, resolveOnErrorCodes } from '@utils/util';
import { Guild, GuildMember, MessageEmbed, Permissions, TextChannel, User } from 'discord.js';
import { Event, EventStore, LanguageKeysSimple } from 'klasa';

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
		Join: { color: Colors.Green, title: 'EVENTS_GUILDMEMBERADD' },
		Mute: { color: Colors.Amber, title: 'EVENTS_GUILDMEMBERADD_MUTE' }
	} as const;

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: DiscordEvents.GuildMemberAdd, emitter: store.client.ws });
	}

	public async run(data: WSGuildMemberAdd) {
		const guild = this.client.guilds.get(data.guild_id);
		if (!guild || !guild.available) return;

		guild.memberTags.set(data.user.id, {
			nickname: data.nick || null,
			joinedAt: new Date(data.joined_at).getTime(),
			roles: data.roles
		});
		guild.client.userTags.create(data.user);
		const member = guild.members.add(data);

		if (await this.handleRAID(guild, member)) return;
		if (await this.handleStickyRoles(guild, member)) return;
		this.handleJoinDM(guild, member);
		this.handleInitialRole(guild, member);
		this.handleGreetingMessage(guild, member);

		// If not muted and memberAdd is configured, handle everything
		if (guild.settings.get(GuildSettings.Events.MemberAdd)) {
			this.handleMemberLog(guild, member, this.kMessageLogMetaData.Join);
		}
	}

	private handleMemberLog(guild: Guild, member: GuildMember, asset: MessageLogMetaData) {
		this.client.emit(Events.GuildMessageLog, MessageLogsEnum.Member, guild, () =>
			new MessageEmbed()
				.setColor(asset.color)
				.setAuthor(`${member.user.tag} (${member.user.id})`, member.user.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
				.setDescription(
					guild.language.get('EVENTS_GUILDMEMBERADD_DESCRIPTION', {
						mention: member.toString(),
						time: Date.now() - member.user.createdTimestamp
					})
				)
				.setFooter(guild.language.get(asset.title))
				.setTimestamp()
		);
	}

	private handleGreetingMessage(guild: Guild, member: GuildMember) {
		const channelsGreeting = guild.settings.get(GuildSettings.Channels.Greeting);
		const messagesGreeting = guild.settings.get(GuildSettings.Messages.Greeting);
		if (channelsGreeting && messagesGreeting) {
			const channel = guild.channels.get(channelsGreeting) as TextChannel;
			if (channel && channel.postable) {
				channel.send(this.transformMessage(messagesGreeting, guild, member.user)).catch((error) => this.client.emit(Events.ApiError, error));
			} else {
				guild.settings.reset(GuildSettings.Channels.Greeting).catch((error) => this.client.emit(Events.Wtf, error));
			}
		}
	}

	private handleInitialRole(guild: Guild, member: GuildMember) {
		const initialRole = guild.settings.get(GuildSettings.Roles.Initial);
		if (initialRole) {
			const role = guild.roles.get(initialRole);
			if (!role || role.position >= guild.me!.roles.highest.position) {
				guild.settings.reset(GuildSettings.Roles.Initial).catch((error) => this.client.emit(Events.Wtf, error));
			} else {
				member.roles.add(role).catch((error) => this.client.emit(Events.ApiError, error));
			}
		}
	}

	private handleJoinDM(guild: Guild, member: GuildMember) {
		const messagesJoinDM = guild.settings.get(GuildSettings.Messages.JoinDM);
		if (messagesJoinDM) {
			floatPromise(
				this,
				resolveOnErrorCodes(member.user.send(this.transformMessage(messagesJoinDM, guild, member.user)), APIErrors.CannotMessageUser)
			);
		}
	}

	private async handleRAID(guild: Guild, member: GuildMember) {
		if (!guild.settings.get(GuildSettings.Selfmod.Raid) || !guild.me!.permissions.has(FLAGS.KICK_MEMBERS)) return false;

		try {
			guild.security.raid.acquire(member.id);
			return false;
		} catch {
			for await (const m of guild.security.raid) {
				if (m) await m.kick();
			}
		}
		return true;
	}

	private async handleStickyRoles(guild: Guild, member: GuildMember) {
		if (!guild.me!.permissions.has(FLAGS.MANAGE_ROLES)) return false;

		const stickyRoles = await guild.stickyRoles.fetch(member.id);
		if (stickyRoles.length === 0) return false;

		// Handle the case the user is muted
		const rolesMuted = guild.settings.get(GuildSettings.Roles.Muted);
		if (rolesMuted && stickyRoles.includes(rolesMuted)) {
			// Handle mute
			const role = guild.roles.get(rolesMuted);
			if (role) {
				member.roles.add(role).catch((error) => this.client.emit(Events.ApiError, error));
			} else {
				guild.settings.reset(GuildSettings.Roles.Muted).catch((error) => this.client.emit(Events.ApiError, error));
			}

			// Handle log
			this.handleMemberLog(guild, member, this.kMessageLogMetaData.Mute);
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
	title: LanguageKeysSimple;
}
