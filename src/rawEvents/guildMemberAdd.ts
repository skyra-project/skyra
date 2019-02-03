import { Guild, GuildMember, MessageEmbed, Permissions, TextChannel, User } from 'discord.js';
import { RawEvent } from '../lib/structures/RawEvent';
import { WSGuildMemberAdd } from '../lib/types/Discord';
import { GuildSettings } from '../lib/types/namespaces/GuildSettings';
import { MessageLogsEnum } from '../lib/util/constants';

const { FLAGS } = Permissions;
const REGEXP = /%MEMBER%|%MEMBERNAME%|%MEMBERTAG%|%GUILD%/g;
const MATCHES = {
	GUILD: '%GUILD%',
	MEMBER: '%MEMBER%',
	MEMBERNAME: '%MEMBERNAME%',
	MEMBERTAG: '%MEMBERTAG%'
};

const COLORS = {
	JOIN: { color: 0x76FF03, title: 'Member Join' },
	MUTE: { color: 0xFDD835, title: 'Muted Member Join' }
};

export default class extends RawEvent {

	public async run(data: WSGuildMemberAdd): Promise<void> {
		const guild = this.client.guilds.get(data.guild_id);
		if (!guild || !guild.available) return;

		guild.memberSnowflakes.add(data.user.id);
		guild.client.usertags.set(data.user.id, `${data.user.username}#${data.user.discriminator}`);
		const member = guild.members.add(data);

		if (await this.handleRAID(guild, member)) return;
		if (this.handleStickyRoles(guild, member)) return;
		this.handleJoinDM(guild, member);
		this.handleInitialRole(guild, member);

		// If not muted and memberAdd is configured, handle everything
		if (guild.settings.get('events.memberAdd')) {
			this.handleMemberLog(guild, member, COLORS.JOIN);
			this.handleGreetingMessage(guild, member);
		}
	}

	public handleMemberLog(guild: Guild, member: GuildMember, asset: { color: number; title: string }): void {
		this.client.emit('guildMessageLog', MessageLogsEnum.Member, guild, () => new MessageEmbed()
			.setColor(asset.color)
			.setAuthor(`${member.user.tag} (${member.user.id})`, member.user.displayAvatarURL())
			.setFooter(asset.title)
			.setTimestamp());
	}

	public handleGreetingMessage(guild: Guild, member: GuildMember): void {
		if (guild.settings.get('channels.default') && guild.settings.get('messages.greeting')) {
			const channel = guild.channels.get(guild.settings.get('channels.default') as string);
			if (channel && (channel as TextChannel).postable) {
				(channel as TextChannel).send(this.transformMessage(guild.settings.get('messages.greeting') as string, guild, member.user))
					.catch((error) => this.client.emit('apiError', error));
			} else {
				guild.settings.reset('channels.default')
					.then(({ errors }) => errors.length ? this.client.emit('wtf', errors[0]) : null)
					.catch((error) => this.client.emit('wtf', error));
			}
		}
	}

	public handleInitialRole(guild: Guild, member: GuildMember): void {
		const initialRole = guild.settings.get(GuildSettings.Roles.Initial) as GuildSettings.Roles.Initial;
		if (initialRole) {
			const role = guild.roles.get(initialRole);
			if (!role || role.position >= guild.me.roles.highest.position) guild.settings.reset('roles.initial')
				.then(({ errors }) => errors.length ? this.client.emit('wtf', errors[0]) : null)
				.catch((error) => this.client.emit('wtf', error));
			else member.roles.add(role)
				.catch((error) => this.client.emit('apiError', error));
		}
	}

	public handleJoinDM(guild: Guild, member: GuildMember): void {
		if (guild.settings.get('messages.join-dm'))
			member.user.send(this.transformMessage(guild.settings.get('messages.join-dm') as string, guild, member.user)).catch(() => null);
	}

	public async handleRAID(guild: Guild, member: GuildMember): Promise<boolean> {
		if (!guild.settings.get('selfmod.raid') || !guild.me.permissions.has(FLAGS.KICK_MEMBERS)) return false;

		try {
			guild.security.raid.acquire(member.id);
			return false;
		} catch {
			for await (const m of guild.security.raid) {
				await m.kick();
			}
		}
		return true;
	}

	public handleStickyRoles(guild: Guild, member: GuildMember): boolean {
		if (!guild.me.permissions.has(FLAGS.MANAGE_ROLES)) return false;

		const all = guild.settings.get(GuildSettings.StickyRoles) as GuildSettings.StickyRoles;
		const stickyRoles = all.find((stickyRole) => stickyRole.user === member.id);
		if (!stickyRoles) return false;

		// Handle the case the user is muted
		const mute = guild.settings.get('roles.muted') as string;
		if (mute && stickyRoles.roles.includes(mute)) {
			// Handle mute
			const role = guild.roles.get(guild.settings.get('roles.muted') as string);
			if (!role) guild.settings.reset('roles.muted').catch((error) => this.client.emit('apiError', error));
			else member.roles.add(role).catch((error) => this.client.emit('apiError', error));

			// Handle log
			this.handleMemberLog(guild, member, COLORS.MUTE);
			return true;
		}

		// Otherwise, grant sticky roles
		const roles = [];
		for (const role of stickyRoles.roles)
			if (guild.roles.has(role)) roles.push(role);

		if (stickyRoles.roles.length !== roles.length)
			guild.settings.update('stickyRoles', { id: member.id, roles }, { arrayIndex: all.indexOf(stickyRoles) })
				.then(({ errors }) => errors.length ? this.client.emit('wtf', errors[0]) : null)
				.catch((error) => this.client.emit('wtf', error));

		member.roles.add(roles).catch((error) => this.client.emit('apiError', error));

		return false;
	}

	public transformMessage(str: string, guild: Guild, user: User): string {
		return str.replace(REGEXP, (match) => {
			switch (match) {
				case MATCHES.MEMBER: return `<@${user.id}>`;
				case MATCHES.MEMBERNAME: return user.username;
				case MATCHES.MEMBERTAG: return user.tag;
				case MATCHES.GUILD: return guild.name;
				default: return match;
			}
		});
	}

}
