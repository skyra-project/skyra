const { Command } = require('../../index');

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			aliases: ['simplepoll'],
			requiredPermissions: ['ADD_REACTIONS'],
			cooldown: 5,
			description: (language) => language.get('COMMAND_SPOLL_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_SPOLL_EXTENDED'),
			usage: '<title:string>'
		});
	}

	async run(msg) {
		for (const reaction of ['👍', '👎', '🤷'])
			if (!msg.reactions.has(reaction)) await msg.react(reaction);

		return msg;
	}

};
