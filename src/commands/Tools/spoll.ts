const { Command } = require('../../index');

export default class extends Command {

	public constructor(client: Skyra, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['simplepoll'],
			requiredPermissions: ['ADD_REACTIONS'],
			cooldown: 5,
			description: (language) => language.get('COMMAND_SPOLL_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_SPOLL_EXTENDED'),
			usage: '<title:string>'
		});
	}

	public async run(msg: SkyraMessage) {
		for (const reaction of ['👍', '👎', '🤷'])
			if (!msg.reactions.has(reaction)) await msg.react(reaction);

		return msg;
	}

}
