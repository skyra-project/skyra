const { Command } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['lock', 'unlock'],
			requiredPermissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
			cooldown: 5,
			description: msg => msg.language.get('COMMAND_LOCKDOWN_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_LOCKDOWN_EXTENDED'),
			permissionLevel: 5,
			runIn: ['text'],
			usage: '[channel:channel] [time:time]',
			usageDelim: ' '
		});
	}

	run(msg, [channel = msg.channel, time]) {
		return this[msg.guild.security.hasLockdown(msg.channel.id) ? 'unlock' : 'lock'](msg, channel, time);
	}

	async unlock(msg, channel) {
		await channel.updateOverwrite(msg.guild.roles.get(msg.guild.id), { SEND_MESSAGES: true });
		msg.guild.security.lockdowns.delete(channel.id);
		return msg.sendMessage(msg.language.get('COMMAND_LOCKDOWN_OPEN', channel));
	}

	async lock(msg, channel, time) {
		const message = await msg.sendMessage(msg.language.get('COMMAND_LOCKDOWN_LOCKING', channel));
		await channel.updateOverwrite(msg.guild.roles.get(msg.guild.id), { SEND_MESSAGES: false });
		if (msg.channel.postable) await msg.sendMessage(msg.language.get('COMMAND_LOCKDOWN_LOCK', channel));
		msg.guild.security.lockdowns.set(channel.id, time
			? setTimeout(() => this.unlock(message, channel), time.getTime() - Date.now())
			: null);
	}

};
