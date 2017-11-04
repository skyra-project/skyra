const { Command } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			guildOnly: true,
			botPerms: [],
			mode: 3,
			cooldown: 15,

			usage: '<add|remove|list> [command:Command] [replacement:string] [...]',
			description: 'Manage aliases for commands for this server.'
		});
	}

	run(msg, [action, command, ...raw], settings, i18n) {
		if (action === 'list')
			return this.list(msg, settings, i18n);
		if (action === 'add' && command.permLevel > 4)
			return Promise.reject(i18n.get('RESOLVER_INVALID_COMMAND', 'command'));
		if (raw.length === 0)
			return Promise.reject(i18n.get('COMMAND_MANAGEALIAS_REQUIRED_REPLACEMENT'));
		const replacement = raw.join(' ');
		return msg.send(i18n.get('COMMAND_MANAGEALIAS_ADD', command, replacement));
	}

};
