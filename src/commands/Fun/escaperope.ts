import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 60,
			description: language => language.tget('COMMAND_ESCAPEROPE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_ESCAPEROPE_EXTENDED')
		});
	}

	public async run(message: KlasaMessage) {
		if (message.deletable) await message.nuke().catch(() => null);
		return message.sendLocale('COMMAND_ESCAPEROPE_OUTPUT', [message.author!]);
	}

}
