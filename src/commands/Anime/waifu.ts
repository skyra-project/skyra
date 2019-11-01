import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';


export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.tget('COMMAND_WAIFU_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_WAIFU_EXTENDED')
		});
	}

	public async run(message: KlasaMessage) {
		return message.send(`https://www.thiswaifudoesnotexist.net/example-${Math.floor(Math.random() * 199999)}.jpg`);
	}

}
