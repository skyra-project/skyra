const { Command } = require('../../../index');

const TYPES = {
	disabled: { number: 0, language: 'COMMAND_SETFILTERMODE_DISABLED' },
	deleteonly: { number: 1, language: 'COMMAND_SETFILTERMODE_DELETEONLY' },
	logonly: { number: 2, language: 'COMMAND_SETFILTERMODE_LOGONLY' },
	all: { number: 3, language: 'COMMAND_SETFILTERMODE_ALL' }
};

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 5,
			description: (msg) => msg.language.get('COMMAND_SETFILTERMODE_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_SETFILTERMODE_EXTENDED'),
			permLevel: 5,
			runIn: ['text'],
			usage: '<disabled|deleteonly|logonly|all>'
		});
	}

	async run(msg, [type]) {
		const { number, language } = TYPES[type];
		if (msg.guild.configs.filter.level === number) throw msg.language.get('COMMAND_SETFILTERMODE_EQUALS');
		await msg.guild.configs.update('filter.level', number);

		return msg.sendMessage(msg.language.get(language));
	}

};
