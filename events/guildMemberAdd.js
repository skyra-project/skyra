const { Event } = require('../index');
const { Permissions: { FLAGS } } = require('discord.js');
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

module.exports = class extends Event {

	run(member) {
		if (!member.guild.available) return;

		const { guild } = member;
		if (guild.security.hasRAID(member.id)) guild.security.raid.delete(member.id);
		if (guild.configs.roles.muted && guild.configs.mutes.includes(member.id)) {
			this._handleMute(guild, member);
		} else if (guild.configs.events.memberRemove) {
			this._handleJoin(guild, member);
			this._handleLog(guild, member, COLORS.JOIN);
			this._handleMessage(guild, member);
		}
	}

	async _handleMute(guild, member) {
		this._handleLog(guild, member, COLORS.MUTE).catch(error => this.client.emit('error', error));
		if (guild.me.permissions.has(FLAGS.MANAGE_ROLES)) {
			const role = guild.roles.get(guild.configs.roles.muted);
			if (!role) guild.configs.reset('roles.muted').catch(error => this.client.emit('error', error));
			else member.addRole(role).catch(error => this.client.emit('error', error));
		}
	}

	async _handleJoin(guild, member) {
		if (guild.configs.selfmod.raid && guild.me.permissions.has(FLAGS.KICK_MEMBERS)) {
			if (await this._handleRAID(guild, member)) return;
		}
		if (guild.configs.roles.initial) {
			const role = guild.roles.get(guild.configs.roles.initial);
			if (!role) guild.configs.reset('roles.initial');
			else member.addRole(role);
		}
		if (guild.configs.messages['join-dm']) {
			member.user.send(this._handleGreeting(guild.configs.messages['join-dm'], guild, member.user)).catch(() => null);
		}
	}

	async _handleLog(guild, member, asset) {
		if (guild.configs.channels.log) {
			const channel = guild.channels.get(guild.configs.channels.log);
			if (!channel) await guild.configs.reset('channels.log');
			else await channel.send(new this.client.methods.Embed()
				.setColor(asset.color)
				.setAuthor(`${member.user.tag} (${member.user.id})`, member.user.displayAvatarURL())
				.setFooter(asset.title)
				.setTimestamp());
		}
	}

	async _handleMessage(guild, member) {
		if (guild.configs.channels.default && guild.configs.messages.greeting) {
			const channel = guild.channels.get(guild.configs.channels.default);
			if (channel) channel.send(this._handleGreeting(guild.configs.messages.greeting, guild, member.user));
			else guild.configs.reset('channels.default');
		}
	}

	async _handleRAID(guild, member) {
		const raidManager = guild.security.raid;
		if (raidManager.has(member.id) || raidManager.add(member.id).size < guild.configs.selfmod.raidthreshold) {
			return false;
		}
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
