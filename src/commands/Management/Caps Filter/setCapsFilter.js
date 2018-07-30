const { Command } = require('../../../index');

/* eslint-disable no-bitwise */
const VALUES = {
	alert: { value: 1 << 2, key: 'COMMAND_SETCAPSFILTER_ALERT' },
	log: { value: 1 << 1, key: 'COMMAND_SETCAPSFILTER_LOG' },
	delete: { value: 1 << 0, key: 'COMMAND_SETCAPSFILTER_DELETE' }
};

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 5,
			description: (msg) => msg.language.get('COMMAND_SETCAPSFILTER_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_SETCAPSFILTER_EXTENDED'),
			permissionLevel: 5,
			runIn: ['text'],
			usage: '<delete|log|alert> [enable|disable]',
			usageDelim: ' '
		});
	}

	async run(msg, [type, mode = 'enable']) {
		const { value, key } = VALUES[type];
		const enable = mode === 'enable';
		const changed = enable
			? msg.guild.configs.selfmod.capsfilter | value
			: msg.guild.configs.selfmod.capsfilter & ~value;
		if (msg.guild.configs.selfmod.capsfilter === changed) throw msg.language.get('COMMAND_SETCAPSFILTER_EQUALS');
		await msg.guild.configs.update('selfmod.capsfilter', changed);

		return msg.sendLocale(key, [enable]);
	}

};
