const { Command } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['simplepoll'],
			botPerms: ['ADD_REACTIONS'],
			cooldown: 5,
			description: msg => msg.language.get('COMMAND_SPOLL_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_SPOLL_EXTENDED'),
			usage: '<title:string>'
		});
	}

	async run(msg) {
		for (const reaction of ['👍', '👎', '🤷']) {
			if (!msg.reactions.has(reaction)) await msg.react(reaction);
		}
		return msg;
	}

};
