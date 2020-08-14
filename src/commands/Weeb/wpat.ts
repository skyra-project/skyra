import { WeebCommand } from '@lib/structures/WeebCommand';
import { CommandStore } from 'klasa';

export default class extends WeebCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: (language) => language.tget('COMMAND_WPAT_DESCRIPTION'),
			extendedHelp: (language) => language.tget('COMMAND_WPAT_EXTENDED'),
			queryType: 'pat',
			responseName: 'COMMAND_WPAT',
			usage: '<user:username>'
		});
	}
}
