import { CommandStore } from 'klasa';
import { WeebCommand } from '../../lib/structures/WeebCommand';

export default class extends WeebCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.get('COMMAND_WBLUSH_DESCRIPTION'),
			extendedHelp: language => language.get('COMMAND_WBLUSH_EXTENDED'),
			queryType: 'blush',
			responseName: 'COMMAND_WBLUSH'
		});
	}

}
