import { KlasaMessage, Monitor } from 'klasa';
const MESSAGE_REGEXP = /%ROLE%|%MEMBER%|%MEMBERNAME%|%GUILD%|%POINTS%/g;

export default class extends Monitor {

	public async run(message: KlasaMessage): Promise<void> {
		if (!message.guild
			|| (message.guild.settings.get('social.ignoreChannels') as any[]).includes(message.channel.id)
			|| this.cooldown(message)) return;

		if (!message.member) await message.guild.members.fetch(message.author.id).catch(() => null);

		// Ensure the user and member settings are up-to-date
		await Promise.all([message.author.settings.sync(), message.member.settings.sync()]);

		try {
			const add = Math.round(((Math.random() * 4) + 4) * (message.guild.settings.get('social.monitorBoost') as number));
			await Promise.all([message.author.settings.increase('points', add), message.member.settings.increase('points', add)]);
		} catch (err) {
			this.client.emit('error', `Failed to add points to ${message.author.id}: ${(err && err.stack) || err}`);
		}
	}

	public cooldown(msg) {
		return !this.client.timeoutManager.set(`social-${msg.author.id}`, Date.now() + 60000, () => null);
	}

	public async handleRoles(msg, memberPoints) {
		const autoRoles = msg.guild.settings.roles.auto;
		if (!autoRoles.length || !msg.guild.me.permissions.has(MANAGE_ROLES)) return null;

		const autoRole = this.getLatestRole(autoRoles, memberPoints);
		if (!autoRole) return null;

		const role = msg.guild.roles.get(autoRole.id);
		if (!role || role.position > msg.guild.me.roles.highest.position) {
			return msg.guild.settings.update('roles.auto', autoRole, { action: 'delete' })
				.then(() => this.handleRoles(msg, memberPoints))
				.catch((error) => this.client.emit('apiError', error));
		}

		if (msg.member.roles.has(role.id)) return null;

		return msg.member.roles.add(role)
			.then(() => msg.guild.settings.social.achieve && msg.channel.postable
				? msg.channel.send(this.getMessage(msg.member, role, msg.guild.settings.social.achieveMessage || msg.language.get('MONITOR_SOCIAL_ACHIEVEMENT')))
				: null);
	}

	public getMessage(member, role, message) {
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

	public getLatestRole(autoRoles, points) {
		let latest = null;
		for (const role of autoRoles) {
			if (role.points > points) break;
			latest = role;
		}
		return latest;
	}

}
