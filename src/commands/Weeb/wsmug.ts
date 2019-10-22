import { CommandStore } from 'klasa';
import { WeebCommand } from '../../lib/structures/WeebCommand';

export default class extends WeebCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.tget('COMMAND_WSMUG_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_WSMUG_EXTENDED'),
			queryType: 'smug',
			responseName: 'COMMAND_WSMUG'
		});
	}

}
