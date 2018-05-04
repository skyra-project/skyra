const { Command } = require('../../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			bucket: 2,
			cooldown: 10,
			description: (msg) => msg.language.get('COMMAND_SETMESSAGELOGS_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_SETMESSAGELOGS_EXTENDED'),
			permLevel: 6,
			runIn: ['text'],
			usage: '<here|channel:channel>'
		});
	}

	async run(msg, [channel]) {
		if (channel === 'here') ({ channel } = msg);
		else if (channel.type !== 'text') throw msg.language.get('CONFIGURATION_TEXTCHANNEL_REQUIRED');
		if (msg.guild.configs.channels.messagelogs === channel.id) throw msg.language.get('CONFIGURATION_EQUALS');
		await msg.guild.configs.update('channels.messagelogs', channel);
		return msg.sendMessage(msg.language.get('COMMAND_SETMESSAGELOGS_SET', channel));
	}

};
