import { CommandStore } from 'klasa';
import { WeebCommand } from '../../lib/structures/WeebCommand';

export default class extends WeebCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.tget('COMMAND_WSTARE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_WSTARE_EXTENDED'),
			queryType: 'stare',
			responseName: 'COMMAND_WSTARE',
			usage: '<user:username>'
		});
	}

}
