const { Command } = require('../../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get('COMMAND_SETROLECHANNEL_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_SETROLECHANNEL_EXTENDED'),
			permissionLevel: 6,
			runIn: ['text'],
			usage: '<here|channel:channel>'
		});
	}

	async run(msg, [channel]) {
		if (channel === 'here') ({ channel } = msg);
		else if (channel.type !== 'text') throw msg.language.get('CONFIGURATION_TEXTCHANNEL_REQUIRED');
		if (msg.guild.configs.channels.roles === channel.id) throw msg.language.get('CONFIGURATION_EQUALS');
		await msg.guild.configs.update(['channels.roles', 'roles.messageReaction'], [channel, null]);
		return msg.sendLocale('COMMAND_SETROLECHANNEL_SET', [channel]);
	}

};
