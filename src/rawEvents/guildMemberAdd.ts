import { RawEvent, MessageEmbed, Permissions: { FLAGS }, constants: { MESSAGE_LOGS } } from '../index';
const REGEXP = /%MEMBER%|%MEMBERNAME%|%MEMBERTAG%|%GUILD%/g;
const MATCHES = {
	MEMBER: '%MEMBER%',
	MEMBERNAME: '%MEMBERNAME%',
	MEMBERTAG: '%MEMBERTAG%',
	GUILD: '%GUILD%'
};

const COLORS = {
	JOIN: { color: 0x76FF03, title: 'Member Join' },
	MUTE: { color: 0xFDD835, title: 'Muted Member Join' }
};

export default class extends RawEvent {

	/**
	 *	GUILD_MEMBER_ADD Packet
	 *	#######################
	 *	{
	 *		user: {
	 *			username: 'name',
	 *			id: 'id',
	 *			discriminator: 'discriminator',
	 *			avatar: 'avatar'
	 *		},
	 *		roles: [],
	 *		nick: null,
	 *		mute: false,
	 *		joined_at: '2018-10-09T12:11:04.193105+00:00',
	 *		guild_id: 'id',
	 *		deaf: false
	 *	}
	 */

	async run(data) {
		const guild = this.client.guilds.get(data.guild_id);
		if (!guild || !guild.available) return;

		guild.memberSnowflakes.add(data.user.id);
		guild.client.usernames.set(data.user.id, `${data.user.username}#${data.user.discriminator}`);
		const member = guild.members.add(data);

		if (await this.handleRAID(guild, member)) return;
		if (this.handleStickyRoles(guild, member)) return;
		this.handleJoinDM(guild, member);
		this.handleInitialRole(guild, member);

		// If not muted and memberAdd is configured, handle everything
		if (guild.settings.events.memberAdd) {
			this.handleMemberLog(guild, member, COLORS.JOIN);
			this.handleGreetingMessage(guild, member);
		}
	}

	handleMemberLog(guild, member, asset) {
		this.client.emit('guildMessageLog', MESSAGE_LOGS.kMember, guild, () => new MessageEmbed()
			.setColor(asset.color)
			.setAuthor(`${member.user.tag} (${member.user.id})`, member.user.displayAvatarURL())
			.setFooter(asset.title)
			.setTimestamp());
	}

	handleGreetingMessage(guild, member) {
		if (guild.settings.channels.default && guild.settings.messages.greeting) {
			const channel = guild.channels.get(guild.settings.channels.default);
			if (channel && channel.postable) {
				channel.send(this.transformMessage(guild.settings.messages.greeting, guild, member.user))
					.catch(error => this.client.emit('apiError', error));
			} else {
				guild.settings.reset('channels.default');
			}
		}
	}

	handleInitialRole(guild, member) {
		if (guild.settings.roles.initial) {
			const role = guild.roles.get(guild.settings.roles.initial);
			if (!role || role.position >= guild.me.roles.highest.position) guild.settings.reset('roles.initial');
			else member.roles.add(role).catch(error => this.client.emit('apiError', error));
		}
	}

	handleJoinDM(guild, member) {
		if (guild.settings.messages['join-dm'])
			member.user.send(this.transformMessage(guild.settings.messages['join-dm'], guild, member.user)).catch(() => null);
	}

	async handleRAID(guild, member) {
		if (!guild.settings.selfmod.raid || !guild.me.permissions.has(FLAGS.KICK_MEMBERS)) return false;

		const raidManager = guild.security.raid;
		if (raidManager.has(member.id) || (raidManager.add(member.id).size < guild.settings.selfmod.raidthreshold))
			return false;

		await raidManager.execute();
		return true;
	}

	handleStickyRoles(guild, member) {
		if (!guild.me.permissions.has(FLAGS.MANAGE_ROLES)) return false;

		const stickyRoles = guild.settings.stickyRoles.find(stickyRole => stickyRole.id === member.id);
		if (!stickyRoles) return false;


		// Handle the case the user is muted
		const mute = guild.settings.roles.muted;
		if (mute && stickyRoles.roles.includes(mute)) {
			// Handle mute
			const role = guild.roles.get(guild.settings.roles.muted);
			if (!role) guild.settings.reset('roles.muted').catch(error => this.client.emit('apiError', error));
			else member.roles.add(role).catch(error => this.client.emit('apiError', error));

			// Handle log
			this.handleMemberLog(guild, member, COLORS.MUTE);
			return true;
		}

		// Otherwise, grant sticky roles
		const roles = [];
		for (const role of stickyRoles.roles)
			if (guild.roles.has(role)) roles.push(role);

		if (stickyRoles.roles.length !== roles.length)
			guild.settings.update('stickyRoles', { id: member.id, roles }, { arrayPosition: guild.settings.stickyRoles.indexOf(stickyRoles) });

		member.roles.add(roles).catch(error => this.client.emit('apiError', error));

		return false;
	}

	transformMessage(string, guild, user) {
		return string.replace(REGEXP, match => {
			switch (match) {
				case MATCHES.MEMBER: return `<@${user.id}>`;
				case MATCHES.MEMBERNAME: return user.username;
				case MATCHES.MEMBERTAG: return user.tag;
				case MATCHES.GUILD: return guild.name;
				default: return match;
			}
		});
	}

};
