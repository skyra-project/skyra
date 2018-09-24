const { Command } = require('../../../index');

const TYPES = {
	disabled: { number: 0, language: 'COMMAND_SETFILTERMODE_DISABLED' },
	deleteonly: { number: 1, language: 'COMMAND_SETFILTERMODE_DELETEONLY' },
	logonly: { number: 2, language: 'COMMAND_SETFILTERMODE_LOGONLY' },
	all: { number: 3, language: 'COMMAND_SETFILTERMODE_ALL' }
};

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			cooldown: 5,
			description: (language) => language.get('COMMAND_SETFILTERMODE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_SETFILTERMODE_EXTENDED'),
			permissionLevel: 5,
			runIn: ['text'],
			usage: '<disabled|deleteonly|logonly|all>'
		});
	}

	async run(msg, [type]) {
		const { number, language } = TYPES[type];
		if (msg.guild.settings.filter.level === number) throw msg.language.get('COMMAND_SETFILTERMODE_EQUALS');
		await msg.guild.settings.update('filter.level', number);

		return msg.sendLocale(language);
	}

};
