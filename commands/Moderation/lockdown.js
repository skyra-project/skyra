const { Command, TimeParser } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['lock', 'unlock'],
			botPerms: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
			cooldown: 5,
			description: 'Lock/unlock the selected channel.',
			permLevel: 5,
			runIn: ['text'],
			usage: '[channel:channel] [time:string] [...]',
			usageDelim: ' '
		});
	}

	run(msg, [channel = msg.channel, ...time]) {
		return this[msg.guild.security.hasLockdown(msg.channel.id) ? 'unlock' : 'lock'](msg, channel, time.length > 0 ? time.join(' ') : null);
	}

	async unlock(msg, channel) {
		await channel.overwritePermissions(msg.guild.roles.get(msg.guild.id), { SEND_MESSAGES: true });
		msg.guild.security.lockdowns.delete(channel.id);
		return msg.sendMessage(msg.language.get('COMMAND_LOCKDOWN_OPEN', channel));
	}

	async lock(msg, channel, time) {
		const message = await msg.sendMessage(msg.language.get('COMMAND_LOCKDOWN_LOCKING', channel));
		await channel.overwritePermissions(msg.guild.roles.get(msg.guild.id), { SEND_MESSAGES: false });
		if (msg.channel.postable) await msg.sendMessage(msg.language.get('COMMAND_LOCKDOWN_LOCK', channel));
		msg.guild.security.lockdowns.set(channel.id, time
			? setTimeout(() => this.unlock(message, channel), new TimeParser(time).duration)
			: null);
	}

};
