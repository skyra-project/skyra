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
		if (msg.guild.roles.size >= 250) throw msg.language.get('COMMAND_MUTE_CONFIGURE_TOOMANY_ROLES');
		await createMuteRole(await msg.sendLocale('SYSTEM_PROCESSING'));
		return msg.responses;
	}

};
