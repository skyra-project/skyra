import { Guild, GuildMember, MessageEmbed, Permissions, TextChannel, User } from 'discord.js';
import { WSGuildMemberAdd } from '../lib/types/DiscordAPI';
import { Events } from '../lib/types/Enums';
import { GuildSettings } from '../lib/types/settings/GuildSettings';
import { MessageLogsEnum } from '../lib/util/constants';
import { Event, EventStore } from 'klasa';

const { FLAGS } = Permissions;
const REGEXP = /%MEMBER%|%MEMBERNAME%|%MEMBERTAG%|%GUILD%|%POSITION%|%MEMBERCOUNT%/g;
const MATCHES = {
	GUILD: '%GUILD%',
	MEMBER: '%MEMBER%',
	MEMBERNAME: '%MEMBERNAME%',
	MEMBERTAG: '%MEMBERTAG%',
	MEMBERCOUNT: '%MEMBERCOUNT%',
	POSITION: '%POSITION%'
};

const COLORS = {
	JOIN: { color: 0x76FF03, title: 'Member Join' },
	MUTE: { color: 0xFDD835, title: 'Muted Member Join' }
};

export default class extends Event {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: 'GUILD_MEMBER_ADD', emitter: store.client.ws });
	}

	public async run(data: WSGuildMemberAdd) {
		const guild = this.client.guilds.get(data.guild_id);
		if (!guild || !guild.available) return;

		guild.nicknames.set(data.user.id, data.nick || null);
		guild.client.userTags.create(data.user);
		const member = guild.members.add(data);

		if (await this.handleRAID(guild, member)) return;
		if (this.handleStickyRoles(guild, member)) return;
		this.handleJoinDM(guild, member);
		this.handleInitialRole(guild, member);
		this.handleGreetingMessage(guild, member);

		// If not muted and memberAdd is configured, handle everything
		if (guild.settings.get(GuildSettings.Events.MemberAdd)) {
			this.handleMemberLog(guild, member, COLORS.JOIN);
		}
	}

	private handleMemberLog(guild: Guild, member: GuildMember, asset: { color: number; title: string }) {
		this.client.emit(Events.GuildMessageLog, MessageLogsEnum.Member, guild, () => new MessageEmbed()
			.setColor(asset.color)
			.setAuthor(`${member.user.tag} (${member.user.id})`, member.user.displayAvatarURL())
			.setFooter(asset.title)
			.setTimestamp());
	}

	private handleGreetingMessage(guild: Guild, member: GuildMember) {
		const channelsGreeting = guild.settings.get(GuildSettings.Channels.Greeting);
		const messagesGreeting = guild.settings.get(GuildSettings.Messages.Greeting);
		if (channelsGreeting && messagesGreeting) {
			const channel = guild.channels.get(channelsGreeting);
			if (channel && (channel as TextChannel).postable) {
				(channel as TextChannel).send(this.transformMessage(messagesGreeting, guild, member.user))
					.catch(error => this.client.emit(Events.ApiError, error));
			} else {
				guild.settings.reset(GuildSettings.Channels.Greeting, { throwOnError: true })
					.catch(error => this.client.emit(Events.Wtf, error));
			}
		}
	}

	private handleInitialRole(guild: Guild, member: GuildMember) {
		const initialRole = guild.settings.get(GuildSettings.Roles.Initial);
		if (initialRole) {
			const role = guild.roles.get(initialRole);
			if (!role || role.position >= guild.me!.roles.highest.position) {
				guild.settings.reset(GuildSettings.Roles.Initial, { throwOnError: true })
					.catch(error => this.client.emit(Events.Wtf, error));
			} else {
				member.roles.add(role)
					.catch(error => this.client.emit(Events.ApiError, error));
			}
		}
	}

	private handleJoinDM(guild: Guild, member: GuildMember) {
		const messagesJoinDM = guild.settings.get(GuildSettings.Messages.JoinDM);
		if (messagesJoinDM) {
			member.user.send(this.transformMessage(messagesJoinDM, guild, member.user)).catch(() => null);
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

	private handleStickyRoles(guild: Guild, member: GuildMember) {
		if (!guild.me!.permissions.has(FLAGS.MANAGE_ROLES)) return false;

		const all = guild.settings.get(GuildSettings.StickyRoles);
		const stickyRoles = all.find(stickyRole => stickyRole.user === member.id);
		if (!stickyRoles) return false;

		// Handle the case the user is muted
		const rolesMuted = guild.settings.get(GuildSettings.Roles.Muted);
		if (rolesMuted && stickyRoles.roles.includes(rolesMuted)) {
			// Handle mute
			const role = guild.roles.get(rolesMuted);
			if (role) {
				member.roles.add(role)
					.catch(error => this.client.emit(Events.ApiError, error));
			} else {
				guild.settings.reset(GuildSettings.Roles.Muted)
					.catch(error => this.client.emit(Events.ApiError, error));
			}

			// Handle log
			this.handleMemberLog(guild, member, COLORS.MUTE);
			return true;
		}

		// Otherwise, grant sticky roles
		const roles: string[] = [];
		for (const role of stickyRoles.roles) {
			if (guild.roles.has(role)) roles.push(role);
		}

		if (stickyRoles.roles.length !== roles.length) {
			guild.settings.update(GuildSettings.StickyRoles, { id: member.id, roles }, { arrayIndex: all.indexOf(stickyRoles), throwOnError: true })
				.catch(error => this.client.emit(Events.Wtf, error));
		}

		member.roles.add(roles).catch(error => this.client.emit(Events.ApiError, error));

		return false;
	}

	private transformMessage(str: string, guild: Guild, user: User) {
		return str.replace(REGEXP, match => {
			switch (match) {
				case MATCHES.MEMBER: return `<@${user.id}>`;
				case MATCHES.MEMBERNAME: return user.username;
				case MATCHES.MEMBERTAG: return user.tag;
				case MATCHES.GUILD: return guild.name;
				case MATCHES.POSITION: return guild.language.ordinal(guild.memberCount);
				case MATCHES.MEMBERCOUNT: return guild.memberCount.toString();
				default: return match;
			}
		});
	}

}
