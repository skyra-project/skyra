import { WeebCommand } from '@lib/structures/WeebCommand';
import { CommandStore } from 'klasa';

export default class extends WeebCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.tget('COMMAND_WTICKLE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_WTICKLE_EXTENDED'),
			queryType: 'tickle',
			responseName: 'COMMAND_WTICKLE',
			usage: '<user:username>'
		});
	}

}
