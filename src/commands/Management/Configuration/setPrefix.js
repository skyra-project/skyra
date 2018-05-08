const { Command } = require('../../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			bucket: 2,
			cooldown: 10,
			description: (msg) => msg.language.get('COMMAND_SETPREFIX_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_SETPREFIX_EXTENDED'),
			permissionLevel: 6,
			runIn: ['text'],
			usage: '<prefix:string{1,10}>'
		});
	}

	async run(msg, [prefix]) {
		if (msg.guild.configs.prefix === prefix) throw msg.language.get('CONFIGURATION_EQUALS');
		await msg.guild.configs.update('prefix', prefix);
		return msg.sendMessage(msg.language.get('COMMAND_SETPREFIX_SET', prefix));
	}

};
