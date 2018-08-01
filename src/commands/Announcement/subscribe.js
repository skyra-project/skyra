const { Command, util: { announcementCheck } } = require('../../index');

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			requiredPermissions: ['MANAGE_ROLES'],
			cooldown: 15,
			description: (language) => language.get('COMMAND_SUBSCRIBE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_SUBSCRIBE_EXTENDED'),
			runIn: ['text']
		});
	}

	async run(msg) {
		const role = announcementCheck(msg);
		await msg.member.roles.add(role);
		return msg.sendLocale('COMMAND_SUBSCRIBE_SUCCESS', [role.name]);
	}

};
