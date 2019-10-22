import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['simplepoll'],
			cooldown: 5,
			description: language => language.tget('COMMAND_SPOLL_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_SPOLL_EXTENDED'),
			requiredPermissions: ['ADD_REACTIONS', 'READ_MESSAGE_HISTORY'],
			usage: '<title:string>'
		});
	}

	public async run(message: KlasaMessage) {
		for (const reaction of ['👍', '👎', '🤷']) {
			if (!message.reactions.has(reaction)) await message.react(reaction);
		}

		return message;
	}

}
