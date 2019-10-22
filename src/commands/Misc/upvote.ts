import { CommandStore, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['updoot'],
			description: language => language.tget('COMMAND_UPVOTE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_UPVOTE_EXTENDED')
		});
	}

	public run(message: KlasaMessage) {
		return message.sendLocale('COMMAND_UPVOTE_MESSAGE');
	}

}
