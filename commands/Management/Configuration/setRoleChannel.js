const { Command } = require('../../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			bucket: 2,
			cooldown: 10,
			description: (msg) => msg.language.get('COMMAND_SETROLECHANNEL_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_SETROLECHANNEL_EXTENDED'),
			permLevel: 6,
			runIn: ['text'],
			usage: '<here|channel:channel>'
		});
	}

	async run(msg, [channel]) {
		if (channel === 'here') channel = msg.channel;
		else if (channel.type !== 'text') throw msg.language.get('CONFIGURATION_TEXTCHANNEL_REQUIRED');
		if (msg.guild.configs.channels.roles === channel.id) throw msg.language.get('CONFIGURATION_EQUALS');
		await msg.guild.configs.update(['channels.roles', 'roles.messageReaction'], [channel, null]);
		return msg.sendMessage(msg.language.get('COMMAND_SETROLECHANNEL_SET', channel));
	}

};
