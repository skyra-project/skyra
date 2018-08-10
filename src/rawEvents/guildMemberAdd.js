const { RawEvent, MessageEmbed, Permissions: { FLAGS } } = require('../index');
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

module.exports = class extends RawEvent {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, { name: 'GUILD_MEMBER_ADD' });
	}

	async run({ guild, member }) {
		guild.nameDictionary.delete(member.id, member.displayName);
		const stickyRoles = guild.settings.stickyRoles.find(stickyRole => stickyRole.id === member.id);
		if (stickyRoles) {
			// Handle the case the user is muted
			const mute = guild.settings.roles.muted;
			if (mute && stickyRoles.roles.includes(mute)) {
				this._handleMute(guild, member);
				return;
			}

			// Otherwise, grant sticky roles
			this._handleStickyRoles(guild, member, stickyRoles);
		}

		// If not muted and memberAdd is configured, handle everything
		if (guild.settings.events.memberAdd) {
			this._handleJoin(guild, member);
			this._handleLog(guild, member, COLORS.JOIN);
			this._handleMessage(guild, member);
		}
	}

	async process(data) {
		const guild = this.client.guilds.get(data.guild_id);
		if (!guild || !guild.available) return null;
		return { guild, member: guild.members.add(data) };
	}

	async _handleStickyRoles(guild, member, stickyRoles) {
		const roles = [];
		for (const role of stickyRoles.roles)
			if (guild.roles.has(role)) roles.push(role);

		if (stickyRoles.roles.length !== roles.length)
			guild.settings.update('stickyRoles', { id: member.id, roles }, { arrayPosition: guild.settings.stickyRoles.indexOf(stickyRoles) });

		await member.roles.add(roles);
	}

	async _handleMute(guild, member) {
		this._handleLog(guild, member, COLORS.MUTE).catch(error => this.client.emit('apiError', error));
		if (guild.me.permissions.has(FLAGS.MANAGE_ROLES)) {
			const role = guild.roles.get(guild.settings.roles.muted);
			if (!role) guild.settings.reset('roles.muted').catch(error => this.client.emit('apiError', error));
			else member.roles.add(role).catch(error => this.client.emit('apiError', error));
		}
	}

	async _handleJoin(guild, member) {
		if (guild.settings.selfmod.raid && guild.me.permissions.has(FLAGS.KICK_MEMBERS))
			if (await this._handleRAID(guild, member)) return;

		if (guild.settings.roles.initial) {
			const role = guild.roles.get(guild.settings.roles.initial);
			if (!role || role.position >= guild.me.roles.highest.position) guild.settings.reset('roles.initial');
			else member.roles.add(role).catch(error => this.client.emit('apiError', error));
		}
		if (guild.settings.messages['join-dm'])
			member.user.send(this._handleGreeting(guild.settings.messages['join-dm'], guild, member.user)).catch(() => null);
	}

	async _handleLog(guild, member, asset) {
		if (guild.settings.channels.log) {
			const channel = guild.channels.get(guild.settings.channels.log);
			if (channel && channel.postable) {
				await channel.send(new MessageEmbed()
					.setColor(asset.color)
					.setAuthor(`${member.user.tag} (${member.user.id})`, member.user.displayAvatarURL())
					.setFooter(asset.title)
					.setTimestamp());
			} else { await guild.settings.reset('channels.log'); }
		}
	}

	async _handleMessage(guild, member) {
		if (guild.settings.channels.default && guild.settings.messages.greeting) {
			const channel = guild.channels.get(guild.settings.channels.default);
			if (channel && channel.postable) channel.send(this._handleGreeting(guild.settings.messages.greeting, guild, member.user));
			else guild.settings.reset('channels.default');
		}
	}

	async _handleRAID(guild, member) {
		const raidManager = guild.security.raid;
		if (raidManager.has(member.id) || raidManager.add(member.id).size < guild.settings.selfmod.raidthreshold)
			return false;

		await raidManager.execute();
		return true;
	}

	_handleGreeting(string, guild, user) {
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
