const { Command } = require('../../index');

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			aliases: ['lock', 'unlock'],
			requiredPermissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
			cooldown: 5,
			description: (language) => language.get('COMMAND_LOCKDOWN_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_LOCKDOWN_EXTENDED'),
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
		return msg.sendLocale('COMMAND_LOCKDOWN_OPEN', [channel]);
	}

	async lock(msg, channel, time) {
		const message = await msg.sendLocale('COMMAND_LOCKDOWN_LOCKING', [channel]);
		await channel.updateOverwrite(msg.guild.roles.get(msg.guild.id), { SEND_MESSAGES: false });
		if (msg.channel.postable) await msg.sendLocale('COMMAND_LOCKDOWN_LOCK', [channel]);
		msg.guild.security.lockdowns.set(channel.id, time
			? setTimeout(() => this.unlock(message, channel), time.getTime() - Date.now())
			: null);
	}

};
