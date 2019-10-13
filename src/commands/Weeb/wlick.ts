import { CommandStore } from 'klasa';
import { WeebCommand } from '../../lib/structures/WeebCommand';

export default class extends WeebCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.tget('COMMAND_WLICK_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_WLICK_EXTENDED'),
			queryType: 'lick',
			responseName: 'COMMAND_WLICK',
			usage: '<user:username>'
		});
	}

}
