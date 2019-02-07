import { CommandStore, KlasaClient, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';

export default class extends SkyraCommand {

	public constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['simplepoll'],
			cooldown: 5,
			description: (language) => language.get('COMMAND_SPOLL_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_SPOLL_EXTENDED'),
			requiredPermissions: ['ADD_REACTIONS'],
			usage: '<title:string>'
		});
	}

	public async run(message: KlasaMessage) {
		for (const reaction of ['👍', '👎', '🤷'])
			if (!message.reactions.has(reaction)) await message.react(reaction);

		return message;
	}

}
