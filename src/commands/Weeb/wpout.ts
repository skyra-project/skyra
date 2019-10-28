import { CommandStore } from 'klasa';
import { WeebCommand } from '../../lib/structures/WeebCommand';

export default class extends WeebCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.tget('COMMAND_WPOUT_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_WPOUT_EXTENDED'),
			queryType: 'pout',
			responseName: 'COMMAND_WPOUT'
		});
	}

}
