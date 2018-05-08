const { Command } = require('../../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			bucket: 2,
			cooldown: 10,
			description: (msg) => msg.language.get('COMMAND_SETIGNORECHANNELS_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_SETIGNORECHANNELS_EXTENDED'),
			permissionLevel: 6,
			runIn: ['text'],
			usage: '<here|channel:channel>'
		});
	}

	async run(msg, [channel]) {
		if (channel === 'here') ({ channel } = msg);
		else if (channel.type !== 'text') throw msg.language.get('CONFIGURATION_TEXTCHANNEL_REQUIRED');
		const oldLength = msg.guild.configs.master.ignoreChannels.length;
		await msg.guild.configs.update('master.ignoreChannels', channel);
		const newLength = msg.guild.configs.master.ignoreChannels.length;
		return msg.sendMessage(msg.language.get(oldLength < newLength
			? 'COMMAND_SETIGNORECHANNELS_SET'
			: 'COMMAND_SETIGNORECHANNELS_REMOVED', channel));
	}

};
