const { Command, Assets: { createMuted } } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			guildOnly: true,
			permLevel: 4,
			botPerms: ['MANAGE_CHANNELS', 'MANAGE_ROLES'],
			mode: 2,
			cooldown: 150,

			description: 'Prepare the mute system.'
		});
	}

	async run(msg, params, settings, i18n) {
		await msg.send(i18n.get('SYSTEM_PROCESSING'));
		return createMuted(msg);
	}

};
