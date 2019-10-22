import { CommandStore } from 'klasa';
import { WeebCommand } from '../../lib/structures/WeebCommand';

export default class extends WeebCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.tget('COMMAND_WDANCE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_WDANCE_EXTENDED'),
			queryType: 'dance',
			responseName: 'COMMAND_WDANCE'
		});
	}

}
