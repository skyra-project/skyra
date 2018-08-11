const { Monitor, Permissions: { FLAGS: { MANAGE_ROLES } } } = require('../index');
const MESSAGE_REGEXP = /%ROLE%|%MEMBER%|%MEMBERNAME%|%GUILD%|%POINTS%/g;

module.exports = class extends Monitor {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			ignoreBots: true,
			ignoreEdits: true,
			ignoreWebhooks: true,
			ignoreSelf: true
		});

		this.cooldowns = new Set();
	}

	async run(msg) {
		if (!msg.guild
			|| msg.guild.settings.social.ignoreChannels.includes(msg.channel.id)
			|| this.cooldown(msg)) return;

		if (!msg.member) await msg.guild.members.fetch(msg.author.id).catch(() => null);
		const memberPoints = msg.member && msg.member.settings;

		// Ensure the user and member settings are up-to-date
		await msg.author.settings.waitSync();
		if (memberPoints && memberPoints._syncStatus) await memberPoints._syncStatus;

		try {
			const add = Math.round(((Math.random() * 4) + 4) * msg.guild.settings.social.monitorBoost);
			await msg.author.settings.update('points', msg.author.settings.points + add);
			if (memberPoints) {
				await memberPoints.update(memberPoints.count + add);
				await this.handleRoles(msg, memberPoints.count);
			}
		} catch (err) {
			this.client.emit('error', `Failed to add points to ${msg.author.id}: ${(err && err.stack) || err}`);
		}
	}

	cooldown(msg) {
		if (this.cooldowns.has(msg.author.id)) return true;
		this.cooldowns.add(msg.author.id);
		setTimeout(() => this.cooldowns.delete(msg.author.id), 60000);
		return false;
	}

	async handleRoles(msg, memberPoints) {
		const autoRoles = msg.guild.settings.roles.auto;
		if (!autoRoles.length || !msg.guild.me.permissions.has(MANAGE_ROLES)) return null;

		const autoRole = this.getLatestRole(autoRoles, memberPoints);
		if (!autoRole) return null;

		const role = msg.guild.roles.get(autoRole.id);
		if (!role || role.position > msg.guild.me.roles.highest.position) {
			return msg.guild.settings.update('roles.auto', autoRole, { action: 'delete' })
				.then(() => this.handleRoles(msg, memberPoints))
				.catch(error => this.client.emit('apiError', error));
		}

		if (msg.member.roles.has(role.id)) return null;

		return msg.member.roles.add(role)
			.then(() => msg.guild.settings.social.achieve && msg.channel.postable
				? msg.channel.send(this.getMessage(msg.member, role, msg.guild.settings.social.achieveMessage || msg.language.get('MONITOR_SOCIAL_ACHIEVEMENT')))
				: null);
	}

	getMessage(member, role, message) {
		return message.replace(MESSAGE_REGEXP, (match) => {
			switch (match) {
				case '%ROLE%': return role.name;
				case '%MEMBER%': return member;
				case '%MEMBERNAME%': return member.user.username;
				case '%GUILD%': return member.guild.name;
				case '%POINTS%': return member.settings.count;
				default: return match;
			}
		});
	}

	getLatestRole(autoRoles, points) {
		let latest = null;
		for (const role of autoRoles) {
			if (role.points > points) break;
			latest = role;
		}
		return latest;
	}

};
