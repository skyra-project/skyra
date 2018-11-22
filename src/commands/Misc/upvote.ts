import { Command } from 'klasa';

export default class extends Command {

	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['updoot'],
			description: (language) => language.get('COMMAND_UPVOTE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_UPVOTE_EXTENDED')
		});
	}

	public run(msg) {
		return msg.sendLocale('COMMAND_UPVOTE_MESSAGE');
	}

}
