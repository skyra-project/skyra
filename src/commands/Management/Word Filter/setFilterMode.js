const { Command } = require('../../../index');

/* eslint-disable no-bitwise */
const VALUES = {
	alert: { value: 1 << 2, key: 'COMMAND_SETFILTERMODE_ALERT' },
	log: { value: 1 << 1, key: 'COMMAND_SETFILTERMODE_LOG' },
	delete: { value: 1 << 0, key: 'COMMAND_SETFILTERMODE_DELETE' }
};

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			cooldown: 5,
			description: (language) => language.get('COMMAND_SETFILTERMODE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_SETFILTERMODE_EXTENDED'),
			permissionLevel: 5,
			runIn: ['text'],
			usage: '<delete|log|alert|show:default> [enable|disable]',
			usageDelim: ' '
		});
	}

	async run(msg, [type, mode = 'enable']) {
		const { level } = msg.guild.settings.filter;
		if (type === 'show') {
			return msg.sendLocale('COMMAND_SETFILTERMODE_SHOW', [
				level & VALUES.alert.value,
				level & VALUES.log.value,
				level & VALUES.delete.value
			], { code: 'asciidoc' });
		}

		const { value, key } = VALUES[type];
		const enable = mode === 'enable';
		const changed = enable
			? level | value
			: level & ~value;
		if (level === changed) throw msg.language.get('COMMAND_SETFILTERMODE_EQUALS');
		await msg.guild.settings.update('filter.level', changed);

		return msg.sendLocale(key, [enable]);
	}

};
