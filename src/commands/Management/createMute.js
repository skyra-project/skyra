const { Command, util: { createMuteRole } } = require('../../index');

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			requiredPermissions: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
			cooldown: 150,
			description: (language) => language.get('COMMAND_CREATEMUTE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_CREATEMUTE_EXTENDED'),
			permissionLevel: 6,
			runIn: ['text']
		});
	}

	async run(msg) {
		await msg.sendLocale('SYSTEM_PROCESSING');
		await createMuteRole(msg);
		return msg.responses;
	}

};
