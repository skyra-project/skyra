const { Command, util: { createMuteRole } } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			botPerms: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
			cooldown: 150,
			description: (msg) => msg.language.get('COMMAND_CREATEMUTE_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_CREATEMUTE_EXTENDED'),
			permLevel: 6,
			runIn: ['text']
		});
	}

	async run(msg) {
		await msg.send(msg.language.get('SYSTEM_PROCESSING'));
		return createMuteRole(msg);
	}

};
