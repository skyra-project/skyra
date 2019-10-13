import { CommandStore } from 'klasa';
import { WeebCommand } from '../../lib/structures/WeebCommand';

export default class extends WeebCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.tget('COMMAND_WCRY_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_WCRY_EXTENDED'),
			queryType: 'cry',
			responseName: 'COMMAND_WCRY',
			usage: '<user:username>'
		});
	}

}
